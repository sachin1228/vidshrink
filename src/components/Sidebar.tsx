import {
  ArrowUpRight,
  BookOpen,
  Clapperboard,
  FileVideo,
  Github,
  Layers,
  Linkedin,
  Scale,
  Sparkles,
  Twitter,
} from "lucide-react";

function NavRow({
  icon,
  label,
  meta,
  active = false,
  badge,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  meta?: string;
  active?: boolean;
  badge?: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className={`group flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-raised text-ink"
          : "text-soft hover:bg-raised/60 hover:text-ink"
      }`}
    >
      <span className={`shrink-0 ${active ? "text-accent" : "text-subtle group-hover:text-soft"}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge ? (
        <span className="rounded border border-accent/40 px-1 py-px font-mono text-[9px] font-medium uppercase tracking-wide text-accent">
          {badge}
        </span>
      ) : null}
      {meta ? <span className="font-mono text-[11px] text-faint">{meta}</span> : null}
    </a>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1.5 pt-5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-faint">
      {children}
    </p>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-[262px] shrink-0 flex-col border-r border-line bg-page md:flex">
      <div className="flex h-14 items-center border-b border-line px-4">
        <a href="/" className="text-[17px] font-semibold tracking-[-0.02em]">
          shrink<span className="text-accent">.md</span>
        </a>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <NavRow icon={<Clapperboard size={16} />} label="Compressor" badge="New" active href="#tool" />
        <NavRow icon={<BookOpen size={16} />} label="How it works" href="#how" />
        <NavRow icon={<Github size={16} />} label="Source on GitHub" href="https://github.com/sachin1228/shrink.md" />

        <SectionLabel>Presets</SectionLabel>
        <NavRow icon={<Sparkles size={16} />} label="Feed · 1080p" meta="Now" active href="#tool" />
        <NavRow icon={<Scale size={16} />} label="Smaller · 720p" meta="Soon" href="#tool" />
        <NavRow icon={<Layers size={16} />} label="Reels · 9:16" meta="Soon" href="#tool" />

        <SectionLabel>Open source</SectionLabel>
        <NavRow icon={<FileVideo size={16} />} label="MP4 · MOV · WebM input" href="#tool" />
        <NavRow icon={<Github size={16} />} label="MIT license" href="https://github.com/sachin1228/shrink.md/blob/main/LICENSE" />
      </nav>

      <div className="p-2">
        <div className="rounded-xl bg-accent p-4 text-accent-ink">
          <p className="text-[13px] font-semibold leading-snug">UX Community</p>
          <p className="mt-1 text-[12px] leading-snug opacity-80">
            Share, learn and grow with designers who ship.
          </p>
          <a
            href="https://uxcommunity.in"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded-full bg-accent-ink px-3 py-1.5 text-[12px] font-medium text-accent transition-opacity hover:opacity-90"
          >
            Join free <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="mt-3 flex items-center gap-2 px-1 pb-1">
          <a
            aria-label="X"
            href="https://x.com/sachin1228"
            target="_blank"
            rel="noreferrer"
            className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-raised2 text-soft transition-colors hover:text-ink"
          >
            <Twitter size={13} />
          </a>
          <a
            aria-label="LinkedIn"
            href="https://www.linkedin.com/in/sachin1228/"
            target="_blank"
            rel="noreferrer"
            className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-raised2 text-soft transition-colors hover:text-ink"
          >
            <Linkedin size={13} />
          </a>
          <a
            aria-label="GitHub"
            href="https://github.com/sachin1228/shrink.md"
            target="_blank"
            rel="noreferrer"
            className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-raised2 text-soft transition-colors hover:text-ink"
          >
            <Github size={13} />
          </a>
        </div>
      </div>
    </aside>
  );
}
