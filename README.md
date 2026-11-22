# shrink.md

**Compress feed videos in your browser.** 1080p, 30 fps, ~3 Mbps — visually identical at feed size, 5–10× smaller. Nothing uploads: every byte stays on your device.

Open source, MIT. Built with [mediabunny](https://mediabunny.dev) and the browser's own codecs via WebCodecs.

## Why

Phone captures and screen recordings record at 8–50 Mbps — far more than a feed card, a chat player or a website hero ever shows. That extra bitrate is pure buffering time for everyone downstream. Re-encoding once, locally, at upload-quality-for-display numbers makes files dramatically smaller with no visible difference:

| Source | Result |
|---|---|
| > 5 MB **and** > ~4 Mbps | re-encoded to a 1080p-class short side, ≤ 30 fps, ~3 Mbps H.264 + AAC 128k |
| ≤ 5 MB, or already ≤ ~4 Mbps | left untouched — re-encoding would only lose quality |
| browser without H.264 WebCodecs | the file is passed through with an explanation |

High-frame-rate sources are handled correctly: the encoder is told the source frame rate (capped at 30 fps), which also keeps its per-frame bitrate budget honest — Chrome otherwise assumes ~30 fps and overshoots a 55–60 fps clip by nearly 2×.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static build in dist/
```

Requires a Chromium-based browser or Safari 17+ for H.264 WebCodecs encoding. No server, no analytics, no network calls after load.

## How it works

1. The file is probed locally with mediabunny (duration, dimensions, average frame rate).
2. Oversized clips are transcoded with WebCodecs H.264 at the target bitrate, with the shorter display side capped at 1080, frame rate capped at 30, audio pinned to AAC so a conversion can never silently drop sound.
3. Any failure falls back safely — you always get either a smaller file or the original.

The compression policy is a port of the upload pipeline from [UX Community](https://github.com/sachin1228/uxcommunity) (MIT).

## License

MIT © 2026 Sachin Patil
