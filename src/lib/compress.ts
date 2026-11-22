/**
 * Local-only video compressor.
 *
 * Oversized clips are re-encoded to a 1080p-class short side, a 30 fps cap
 * and a ~3 Mbps target — visually transparent at feed size, a fraction of
 * the bytes. Small or already-lean files are left untouched. Encoded with
 * mediabunny + WebCodecs (H.264), audio pinned to AAC so a conversion can
 * never silently drop sound.
 */

import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
  canEncodeVideo,
} from "mediabunny";

export const TARGET_BITRATE = 3_000_000;
export const MAX_FRAME_RATE = 30;
export const MAX_SHORT_SIDE = 1080;
export const MIN_BYTES = 5 * 1024 * 1024;
export const SKIP_BITRATE = 4_000_000;

export interface VideoInfo {
  durationSeconds: number;
  width: number;
  height: number;
  frameRate: number;
}

export interface OutcomeBase {
  original: File;
  info: VideoInfo;
}

export type Outcome =
  | (OutcomeBase & { status: "compressed"; file: File; outputInfo: VideoInfo })
  | (OutcomeBase & { status: "already-small"; reason: string })
  | { status: "unsupported"; reason: string; original: File };

/** Mirrors the pipeline policy: skip small files and already-lean bitrates. */
export function shouldCompress(sizeBytes: number, durationSeconds: number): boolean {
  if (!(sizeBytes > MIN_BYTES)) return false;
  if (durationSeconds > 0 && (sizeBytes * 8) / durationSeconds <= SKIP_BITRATE) return false;
  return true;
}

async function probeFile(file: File, track: { displayWidth: number; displayHeight: number; getDurationFromMetadata(): Promise<number | null>; computePacketStats(n: number): Promise<{ averagePacketRate: number }> }): Promise<VideoInfo> {
  const durationSeconds = await track.getDurationFromMetadata().catch(() => null);
  const stats = await track.computePacketStats(1000).catch(() => null);
  return {
    durationSeconds: durationSeconds ?? 0,
    width: track.displayWidth,
    height: track.displayHeight,
    frameRate: stats?.averagePacketRate ?? 0,
  };
}

function evenTarget(shortSide: number): number {
  return shortSide % 2 === 0 ? shortSide : shortSide - 1;
}

/** Sets the shorter display side to 1080 (even), keeping orientation. */
function targetDimensions(info: VideoInfo): { width?: number; height?: number } {
  const shortSide = Math.min(info.width, info.height);
  if (!(shortSide > MAX_SHORT_SIDE)) return {};
  const target = evenTarget(MAX_SHORT_SIDE);
  return info.width >= info.height ? { height: target } : { width: target };
}

export async function compressVideo(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<Outcome> {
  let input: Input;
  try {
    input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  } catch {
    return { status: "unsupported", reason: "This file type isn't supported.", original: file };
  }

  try {
    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) {
      return { status: "unsupported", reason: "There's no video in this file.", original: file };
    }
    const info = await probeFile(file, videoTrack);

    if (!shouldCompress(file.size, info.durationSeconds)) {
      return {
        status: "already-small",
        original: file,
        info,
        reason: "Shrinking this would only make it worse — it's already a small file so we left it alone.",
      };
    }

    if (!(await canEncodeVideo("avc"))) {
      return {
        status: "unsupported",
        original: file,
        reason: "Your browser can't do this yet. Try Chrome, Edge, or the latest Safari.",
      };
    }

    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: "in-memory" }),
      target: new BufferTarget(),
    });
    const frameRate =
      info.frameRate > 0 ? Math.min(MAX_FRAME_RATE, Math.round(info.frameRate * 100) / 100) : undefined;
    const conversion = await Conversion.init({
      input,
      output,
      video: {
        codec: "avc",
        quality: new Quality({ bitrate: TARGET_BITRATE }),
        forceTranscode: true,
        ...(frameRate ? { frameRate } : {}),
        ...targetDimensions(info),
      },
      audio: { codec: "aac", quality: new Quality({ bitrate: 128_000 }) },
    });

    if (!conversion.isValid) {
      return { status: "unsupported", original: file, reason: "We couldn't shrink this video." };
    }
    // Never ship a clip that silently lost its picture or its sound.
    if (
      conversion.discardedTracks.some(
        (item) => item.track.type === "video" || item.track.type === "audio",
      )
    ) {
      return { status: "unsupported", original: file, reason: "We couldn't shrink this video." };
    }

    if (onProgress) conversion.onProgress = (progress) => onProgress(progress);
    await conversion.execute();
    if (!output.target.buffer) {
      return { status: "unsupported", original: file, reason: "Something went wrong — you're getting the original." };
    }

    const name = `${file.name.replace(/\.[^.]+$/, "")}-shrink.mp4`;
    const compressed = new File([output.target.buffer], name, { type: "video/mp4" });
    if (compressed.size >= file.size) {
      return {
        status: "already-small",
        original: file,
        info,
        reason: "Shrinking didn't help, so you're getting your original back.",
      };
    }

    const outputInput = new Input({ formats: ALL_FORMATS, source: new BlobSource(compressed) });
    const outputTrack = await outputInput.getPrimaryVideoTrack();
    const outputInfo = outputTrack ? await probeFile(compressed, outputTrack) : info;

    return { status: "compressed", original: file, info, file: compressed, outputInfo };
  } catch {
    return { status: "unsupported", original: file, reason: "Something went wrong — you're getting the original." };
  }
}
