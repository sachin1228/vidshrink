# vidshrink

**Compress videos in your browser.** 1080p, 30 fps, ~3 Mbps — visually identical at feed size, 5–10× smaller. Nothing uploads.

Open source, MIT. Built with [mediabunny](https://mediabunny.dev) and the browser's own codecs via WebCodecs.

## How it works

- **> 5 MB and > ~4 Mbps** → re-encoded to a 1080p-class short side, ≤ 30 fps, ~3 Mbps H.264 + AAC.
- **Small or already lean** → left untouched — re-encoding would only lose quality.
- **Any failure** → you keep the original file.

High-frame-rate sources are handled correctly: the encoder is told the source frame rate (capped at 30 fps), which keeps its per-frame bitrate budget honest.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static build in dist/
```

Needs a Chromium-based browser or Safari 17+ for H.264 WebCodecs encoding. No server, no analytics, no network calls after load.

## License

MIT © 2026 Sachin Patil
