"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { storyCount, type Persona } from "@/data/personas";
import { PlaneIcon, PlayIcon } from "./icons";
import { useShowcase } from "./showcase-context";

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

export function PersonaCard({ persona: p, priority }: { persona: Persona; priority?: boolean }) {
  const { openProfile, openStories, tgLink } = useShowcase();
  const [ref, inView] = useInView<HTMLElement>();
  const t = p.theme;

  // Vars drive the shared hover styles in globals.css
  const vars = {
    backgroundColor: t.backdrop,
    color: t.fg,
    "--cta-bg": t.ctaBg,
    "--cta-fg": t.ctaFg,
    "--c-fg": t.fg,
    "--c-bg": t.backdrop,
  } as React.CSSProperties;

  return (
    // On desktop the four cards share one subgrid, so every row (bio, stats, CTAs)
    // starts at the same height regardless of copy length.
    <article
      ref={ref}
      id={`card-${p.id}`}
      data-tone={p.id}
      aria-labelledby={`${p.id}-name`}
      className={`relative scroll-mt-14 px-4 pt-20 pb-28 lg:row-span-7 lg:grid lg:grid-rows-subgrid lg:overflow-hidden lg:rounded-[32px] lg:px-5 lg:pt-5 lg:pb-5 ${inView ? "is-in" : ""}`}
      style={vars}
    >
      <div className="card-rise flex items-center justify-between gap-2 font-mono text-[11px] tracking-[0.08em] uppercase" style={{ color: t.muted, "--i": 0 } as React.CSSProperties}>
        <span className="truncate">{p.topic}</span>
        <span className="shrink-0 rounded-full px-2 py-1" style={{ boxShadow: `inset 0 0 0 1px ${t.muted}` }}>
          ИИ-персонаж
        </span>
      </div>

      <button
        type="button"
        onClick={() => openStories(p.id)}
        aria-label={`Смотреть истории: ${p.name}`}
        className="group relative -mx-4 mt-2 block aspect-[4/5] w-[calc(100%+2rem)] lg:-mx-5 lg:w-[calc(100%+2.5rem)]"
      >
        <Image
          src={p.hero.src}
          alt={p.hero.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, 100vw"
          className="seamless object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
          style={{ objectPosition: "50% 20%" }}
        />
        <span
          className="absolute top-[9%] left-4 inline-flex items-center gap-1.5 rounded-full py-1.5 pr-3 pl-2 font-mono text-[11px] tracking-wider uppercase shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5 group-hover:scale-105 lg:left-5"
          style={{ backgroundColor: t.ctaBg, color: t.ctaFg }}
        >
          <span className="flex size-5 items-center justify-center rounded-full" style={{ backgroundColor: t.backdrop, color: t.fg }}>
            <PlayIcon className="ml-px size-2.5" />
          </span>
          Истории · {storyCount(p)}
        </span>
      </button>

      {/* Container lives here, not on the card: containment would switch off the subgrid */}
      <div className="cq relative z-10">
        <h2
          id={`${p.id}-name`}
          className="reveal-line relative -mt-[0.28em] font-display leading-[0.8] font-black uppercase"
          style={{ fontSize: "33cqw" }}
        >
          <span>{p.name}</span>
        </h2>
      </div>

      <p className="card-rise mt-3 font-mono text-[13px]" style={{ color: t.muted, "--i": 1 } as React.CSSProperties}>
        @{p.handle}
      </p>
      <p className="card-rise mt-3 text-[17px] leading-snug lg:text-[15px]" style={{ "--i": 2 } as React.CSSProperties}>
        {p.bio}
      </p>

      <dl className="card-rise mt-6 grid grid-cols-3 gap-3 self-start" style={{ "--i": 3 } as React.CSSProperties}>
        {p.stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse border-t pt-2.5" style={{ borderColor: t.muted }}>
            {/* Labels always reserve two lines so dividers and values never shift */}
            <dt className="mt-1.5 line-clamp-2 min-h-[2.5em] font-mono text-[10px] leading-[1.25] tracking-wide uppercase" style={{ color: t.muted }}>
              {s.label}
            </dt>
            <dd className="font-display text-[30px] leading-none font-black whitespace-nowrap lg:text-[26px]">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="card-rise mt-7 flex gap-2.5 self-end lg:mt-5" style={{ "--i": 4 } as React.CSSProperties}>
        <button type="button" onClick={() => openProfile(p.id)} className="btn-cta press h-14 flex-1 rounded-full text-[16px] font-semibold">
          Смотреть блог
        </button>
        <a
          href={tgLink(p.id)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Написать ${p.nameDative} в Telegram`}
          title={`Написать ${p.nameDative} в Telegram`}
          className="btn-outline press flex size-14 shrink-0 items-center justify-center rounded-full"
        >
          <PlaneIcon />
        </a>
      </div>
    </article>
  );
}
