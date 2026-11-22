import { Clapperboard, Github, Linkedin } from "lucide-react";

function NavRow({
  icon,
  label,
  active = false,
  badge,
  href,
}: {
  icon: React.ReactNode;
  label: string;
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
        active ? "bg-raised text-ink" : "text-soft hover:bg-raised/60 hover:text-ink"
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
    </a>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-line bg-page md:flex">
      <div className="flex h-14 items-center border-b border-line px-4">
        <a href="/" className="text-[17px] font-semibold tracking-[-0.02em]">
          vid<span className="text-accent">shrink</span>
        </a>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <NavRow icon={<Clapperboard size={16} />} label="Shrinker" badge="New" active href="#tool" />
        <NavRow
          icon={<Github size={16} />}
          label="Source on GitHub"
          href="https://github.com/sachin1228/vidshrink"
        />
        <NavRow
          icon={<Github size={16} />}
          label="Free to use"
          href="https://github.com/sachin1228/vidshrink/blob/main/LICENSE"
        />
      </nav>

      <div className="flex items-center gap-2 px-4 pb-4">
        <a
          aria-label="LinkedIn"
          href="https://www.linkedin.com/in/sachin1228/"
          target="_blank"
          rel="noreferrer"
          className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-raised2 text-soft transition-colors hover:text-ink"
        >
          <Linkedin size={13} />
        </a>
      </div>
    </aside>
  );
}
