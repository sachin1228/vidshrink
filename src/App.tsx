import { useCallback, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  FileVideo,
  Github,
  Loader2,
  MousePointerClick,
  Plus,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2,
  Zap,
} from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { compressVideo, MAX_FRAME_RATE, TARGET_BITRATE, type Outcome } from "./lib/compress";

type Phase =
  | { kind: "idle" }
  | { kind: "picked"; file: File }
  | { kind: "working"; file: File; progress: number }
  | { kind: "done"; outcome: Outcome };

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function download(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const HERO_PILLS = [
  { label: "Single file", active: true },
  { label: "Batch", active: false, soon: true },
];

export function App() {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const pick = useCallback((file: File | null | undefined) => {
    if (!file) return;
    setPhase({ kind: "picked", file });
  }, []);

  const start = useCallback(async () => {
    if (phase.kind !== "picked") return;
    const file = phase.file;
    setPhase({ kind: "working", file, progress: 0 });
    const outcome = await compressVideo(file, (progress) =>
      setPhase({ kind: "working", file, progress }),
    );
    setPhase({ kind: "done", outcome });
  }, [phase]);

  const busy = phase.kind === "working";
  const outcome = phase.kind === "done" ? phase.outcome : null;
  const pickedFile =
    phase.kind === "picked" || phase.kind === "working" ? phase.file : null;

  return (
    <div className="flex h-full">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line px-6">
          <div className="flex min-w-0 items-center gap-2 whitespace-nowrap text-sm">
            <span className="flex size-5 items-center justify-center rounded-md bg-accent text-[11px] font-bold text-accent-ink">
              S
            </span>
            <span className="font-medium text-ink">shrink.md</span>
            <span className="text-faint">/</span>
            <span className="hidden truncate text-muted sm:inline">Video Compressor</span>
            <ChevronDown size={14} className="text-faint" />
          </div>
          <a
            href="https://github.com/sachin1228/shrink.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-line2 bg-raised px-3.5 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-raised2"
          >
            <Github size={14} />
            Star on GitHub
            <ArrowUpRight size={13} className="text-subtle" />
          </a>
        </header>

        <div className="mx-auto w-full max-w-[880px] px-8 pb-24">
          <section className="pt-16 text-center">
            <h1 className="text-[clamp(34px,4.6vw,54px)] font-semibold leading-[1.05] tracking-[-0.035em]">
              Shrink{" "}
              <span className="text-accent [text-shadow:0_0_36px_rgba(206,255,0,0.32)]">
                videos
              </span>{" "}
              for the feed.
            </h1>
            <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-relaxed text-soft">
              1080p · 30 fps · ~{(TARGET_BITRATE / 1_000_000).toFixed(0)} Mbps — visually identical
              at feed size, 5–10× smaller. Nothing uploads: every byte stays on this device.
            </p>

            <div className="mt-8 flex items-center justify-center gap-2">
              {HERO_PILLS.map((pill) => (
                <span
                  key={pill.label}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] ${
                    pill.active
                      ? "border-line2 bg-raised text-ink"
                      : "border-line bg-transparent text-subtle"
                  }`}
                >
                  {pill.label}
                  {pill.soon ? (
                    <span className="rounded bg-raised2 px-1.5 py-px font-mono text-[9px] uppercase tracking-wide text-subtle">
                      soon
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          </section>

          <section
            id="tool"
            className={`mt-10 rounded-2xl border bg-panel transition-colors ${
              dragging ? "border-accent/60" : "border-line"
            }`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                dragDepth.current += 1;
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => {
                dragDepth.current = Math.max(0, dragDepth.current - 1);
                if (dragDepth.current === 0) setDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                dragDepth.current = 0;
                setDragging(false);
                pick(event.dataTransfer.files?.[0]);
              }}
              className="flex min-h-[268px] cursor-pointer flex-col items-center justify-center gap-3 px-8 py-10 text-center outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              {pickedFile ? (
                <>
                  <span className="flex size-12 items-center justify-center rounded-xl bg-raised2 text-accent">
                    <FileVideo size={22} />
                  </span>
                  <p className="max-w-[420px] truncate text-[15px] font-medium">{pickedFile.name}</p>
                  <p className="font-mono text-[12px] text-subtle">
                    {formatBytes(pickedFile.size)}
                    {phase.kind === "working" ? ` · compressing ${Math.round(phase.progress * 100)}%` : ""}
                  </p>
                  {phase.kind === "working" ? (
                    <div className="mt-1 h-1 w-[280px] overflow-hidden rounded-full bg-raised2">
                      <div
                        className="h-full rounded-full bg-accent transition-[width] duration-200"
                        style={{ width: `${Math.max(3, Math.round(phase.progress * 100))}%` }}
                      />
                    </div>
                  ) : (
                    <p className="text-[12px] text-faint">Drop another file, or click to replace</p>
                  )}
                </>
              ) : (
                <>
                  <span className="flex size-12 items-center justify-center rounded-xl bg-raised2 text-soft">
                    <UploadCloud size={22} />
                  </span>
                  <p className="text-[15px] text-soft">
                    Drop a video here, or <span className="text-ink underline underline-offset-4">click to choose</span>
                  </p>
                  <p className="font-mono text-[11.5px] text-faint">MP4 · MOV · WebM — processed locally</p>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-line p-3">
              <button
                type="button"
                aria-label="Choose a video"
                onClick={() => inputRef.current?.click()}
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-line2 text-soft transition-colors hover:bg-raised2 hover:text-ink"
              >
                <Plus size={16} />
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-raised px-2.5 py-1.5 text-[12.5px] text-ink">
                <Sparkles size={13} className="text-accent" />
                Feed preset
              </span>
              <span className="rounded-lg px-2 py-1.5 font-mono text-[11.5px] text-subtle">1080p</span>
              <span className="rounded-lg px-2 py-1.5 font-mono text-[11.5px] text-subtle">{MAX_FRAME_RATE} fps</span>
              <span className="rounded-lg px-2 py-1.5 font-mono text-[11.5px] text-subtle">~3 Mbps</span>
              <span className="ml-auto" />
              <button
                type="button"
                disabled={phase.kind !== "picked"}
                onClick={() => void start()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-page transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Compressing
                  </>
                ) : (
                  <>
                    Compress
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              aria-label="Choose a video"
              className="sr-only"
              onChange={(event) => {
                pick(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </section>

          {outcome ? (
            <section className="mt-5 rounded-2xl border border-line bg-panel p-5">
              {outcome.status === "compressed" ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Check size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{outcome.file.name}</p>
                    <p className="mt-0.5 font-mono text-[11.5px] text-subtle">
                      {formatBytes(outcome.original.size)} → {formatBytes(outcome.file.size)} ·{" "}
                      {Math.round((1 - outcome.file.size / outcome.original.size) * 100)}% smaller ·{" "}
                      {outcome.outputInfo.width}×{outcome.outputInfo.height} ·{" "}
                      {Math.round(outcome.outputInfo.frameRate)} fps ·{" "}
                      {formatDuration(outcome.outputInfo.durationSeconds)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => download(outcome.original)}
                      className="cursor-pointer rounded-lg border border-line2 px-3 py-2 text-[12.5px] text-soft transition-colors hover:bg-raised2 hover:text-ink"
                    >
                      Original
                    </button>
                    <button
                      type="button"
                      onClick={() => download(outcome.file)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-accent-ink transition-opacity hover:opacity-90"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-raised2 text-soft">
                    <ShieldCheck size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium">
                      {outcome.status === "already-small" ? "No compression needed" : "Couldn't compress this file"}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-subtle">{outcome.reason}</p>
                  </div>
                  {outcome.status === "already-small" ? (
                    <button
                      type="button"
                      onClick={() => download(outcome.original)}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-lg border border-line2 px-4 py-2 text-[12.5px] text-ink transition-colors hover:bg-raised2 sm:self-auto"
                    >
                      <Download size={14} />
                      Download original
                    </button>
                  ) : null}
                </div>
              )}
            </section>
          ) : null}

          <section id="how" className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-faint">then</span>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
              <MousePointerClick size={14} className="text-subtle" /> Pick a clip
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
              <Wand2 size={14} className="text-subtle" /> Compress locally
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
              <Download size={14} className="text-subtle" /> Download the file
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
              <Zap size={14} className="text-subtle" /> Powered by WebCodecs
            </span>
          </section>

          <footer className="mt-14 text-center text-[12px] leading-relaxed text-faint">
            Open source under the MIT license · Built with{" "}
            <a
              href="https://mediabunny.dev"
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer text-subtle underline underline-offset-4 hover:text-soft"
            >
              mediabunny
            </a>{" "}
            and the browser's own encoders.
            <br />
            Your videos never touch a server — closing the tab ends the session.
          </footer>
        </div>
      </main>
    </div>
  );
}
