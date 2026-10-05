"use client";

import { useEffect, useState } from "react";
import { isPersonaId, personaById, type PersonaId } from "@/data/personas";
import { Avatar } from "./Avatar";
import { PlaneIcon } from "./icons";
import { useShowcase } from "./showcase-context";

type Tone = "hero" | "how" | "final" | PersonaId;
type Section = "hero" | "catalog" | "how" | "final";

const STUDIO = { bg: "#e8e9eb", fg: "#111214", ctaBg: "#111214", ctaFg: "#ffffff" };
const INK = { bg: "#111214", fg: "#ffffff", ctaBg: "#ffffff", ctaFg: "#111214" };

function colorsFor(tone: Tone) {
  if (tone === "final") return INK;
  if (isPersonaId(tone)) {
    const t = personaById[tone].theme;
    return { bg: t.backdrop, fg: t.fg, ctaBg: t.ctaBg, ctaFg: t.ctaFg };
  }
  return STUDIO;
}

const NAV: { id: Section; href: string; label: string }[] = [
  { id: "catalog", href: "#catalog", label: "Блогеры" },
  { id: "how", href: "#how", label: "Как это работает" },
  { id: "final", href: "#contact", label: "Написать" },
];

function useTone() {
  const [tone, setTone] = useState<Tone>("hero");
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);

    // A thin line just under the header decides which section "owns" the chrome
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setTone((e.target as HTMLElement).dataset.tone as Tone);
      },
      { rootMargin: "-10% 0px -89% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-tone]").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, []);

  const section: Section = isPersonaId(tone) ? "catalog" : tone;
  // Side-by-side cards on desktop share one studio surface
  const colorTone: Tone = desktop && isPersonaId(tone) ? "how" : tone;
  return { tone, section, colorTone, desktop };
}

export function Chrome() {
  const { tone, section, colorTone, desktop } = useTone();
  const { tgLink, profile, story } = useShowcase();
  const c = colorsFor(colorTone);
  const persona = isPersonaId(tone) ? personaById[tone] : null;

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", c.bg);
  }, [c.bg]);

  const barVisible = !desktop && (persona !== null || tone === "how") && !profile && !story;
  // An open profile/story is "where you are"; otherwise the section under the header
  const overlayId = story?.persona ?? profile;
  const here = overlayId
    ? personaById[overlayId].name
    : persona
      ? persona.name
      : section === "how"
        ? "Как это работает"
        : section === "final"
          ? "Telegram"
          : "";
  const vars = { "--cta-bg": c.ctaBg, "--cta-fg": c.ctaFg } as React.CSSProperties;

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40 backdrop-blur-md transition-colors duration-500"
        style={{ backgroundColor: `color-mix(in srgb, ${c.bg} 86%, transparent)`, color: c.fg, ...vars }}
      >
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 lg:h-16 lg:px-8">
          <div className="flex min-w-0 items-baseline gap-2">
            <a href="#top" className="flex shrink-0 items-baseline gap-0.5 transition-opacity hover:opacity-70" aria-label="лица.ai — на главную">
              <span className="font-display text-[30px] leading-none font-black tracking-tight uppercase">лица</span>
              <span className="font-mono text-[12px]">.ai</span>
            </a>
            {/* Mobile "you are here" marker */}
            {here && (
              <span key={here} className="anim-fade-up truncate font-mono text-[11px] tracking-wider uppercase opacity-60 lg:hidden" aria-live="polite">
                / {here}
              </span>
            )}
          </div>
          <nav className="flex items-center gap-1 lg:gap-2" aria-label="Разделы страницы">
            {NAV.map((n) => {
              const active = section === n.id;
              return (
                <a
                  key={n.id}
                  href={n.href}
                  aria-current={active ? "true" : undefined}
                  className={`group relative hidden h-10 items-center px-3 text-sm font-medium transition-opacity lg:flex ${active ? "opacity-100" : "opacity-65 hover:opacity-100"}`}
                >
                  {n.label}
                  <span
                    className={`absolute inset-x-3 bottom-1 h-[2px] origin-left rounded-full bg-current transition-transform duration-300 ease-out-soft ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-hover:opacity-40"
                    }`}
                  />
                </a>
              );
            })}
            <a
              href={tgLink(persona?.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta press ml-1 inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold"
            >
              <PlaneIcon className="size-4" />
              Telegram
            </a>
          </nav>
        </div>
      </header>

      <div
        className="fixed inset-x-3 z-40 transition-[transform,opacity] duration-500 ease-out-soft lg:hidden"
        style={{
          bottom: "calc(12px + env(safe-area-inset-bottom))",
          transform: barVisible ? "none" : "translateY(140%)",
          opacity: barVisible ? 1 : 0,
          ...vars,
        }}
        aria-hidden={!barVisible}
      >
        <a
          href={tgLink(persona?.id)}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={barVisible ? 0 : -1}
          className="btn-cta press flex h-16 items-center gap-3 rounded-full pr-2 pl-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)]"
        >
          {persona ? (
            <Avatar key={`avatar-${persona.id}`} persona={persona} className="anim-swap size-12" />
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: c.ctaFg, color: c.ctaBg }}>
              <PlaneIcon />
            </span>
          )}
          {/* keyed so the label eases to the next persona instead of snapping */}
          <span key={`label-${persona?.id ?? "all"}`} className="anim-swap min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[16px] font-semibold">
              {persona ? `Написать ${persona.nameDative}` : "Перейти в Telegram"}
            </span>
            <span className="block font-mono text-[10px] tracking-wider uppercase opacity-60">
              {persona ? "в Telegram · отвечает 24/7" : "все блогеры в одном боте"}
            </span>
          </span>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: c.ctaFg, color: c.ctaBg }}>
            <PlaneIcon />
          </span>
        </a>
      </div>
    </>
  );
}
