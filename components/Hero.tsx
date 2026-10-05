"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { personas, storyCount } from "@/data/personas";
import { ArrowDownIcon, PlaneIcon, PlayIcon } from "./icons";
import { useShowcase } from "./showcase-context";

export function Hero() {
  const { openStories, tgLink } = useShowcase();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setAuto(false);
  }, []);

  // Ambient rotation: each face takes the stage in turn until the visitor takes over
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setActive((i) => (i + 1) % personas.length), 2800);
    return () => clearInterval(t);
  }, [auto]);

  const takeOver = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  return (
    <section id="top" data-tone="hero" className="relative bg-studio pt-14 lg:pt-16">
      <div className="mx-auto grid max-w-[1400px] gap-5 px-4 pt-5 pb-10 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-16">
        <div className={`flex flex-col ${mounted ? "is-in" : ""}`}>
          <p className="anim-fade-up font-mono text-[11px] tracking-[0.08em] text-ink/60 uppercase">
            4 ИИ-блогера · отвечают в Telegram
          </p>
          <h1 className="mt-3 font-display text-[clamp(56px,16.5vw,96px)] lg:text-[clamp(72px,7.4vw,136px)] leading-[0.84] font-black tracking-[-0.01em] uppercase">
            <span className="reveal-line"><span>Блогеры,</span></span>
            <span className="reveal-line"><span>которых</span></span>
            <span className="reveal-line"><span>не существует</span></span>
          </h1>
          <p className="anim-fade-up mt-4 max-w-[30ch] text-[17px] leading-snug text-ink/80 [animation-delay:0.3s] lg:mt-6 lg:text-xl">
            Но они ведут блоги, снимают истории и ответят вам в&nbsp;Telegram. Выберите, с&nbsp;кем поговорить.
          </p>
          <div className="anim-fade-up mt-6 hidden gap-3 [animation-delay:0.4s] lg:flex">
            <HeroButtons tg={tgLink()} />
          </div>
        </div>

        <div
          className="flex h-[min(40svh,380px)] gap-1.5 lg:h-[min(72svh,640px)] lg:gap-2.5"
          onMouseLeave={() => setAuto(false)}
        >
          {personas.map((p, i) => {
            const on = i === active;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => openStories(p.id)}
                onMouseEnter={() => takeOver(i)}
                onFocus={() => takeOver(i)}
                aria-label={`Смотреть истории: ${p.name}`}
                className="anim-pop group relative min-w-0 overflow-hidden rounded-[18px] text-left transition-[flex-grow] duration-700 ease-out-soft lg:rounded-[26px]"
                style={{
                  flexGrow: on ? 3.4 : 1,
                  flexBasis: 0,
                  backgroundColor: p.theme.backdrop,
                  color: p.theme.fg,
                  animationDelay: `${0.15 + i * 0.07}s`,
                }}
              >
                <Image
                  src={p.hero.src}
                  alt={p.hero.alt}
                  fill
                  priority={i < 2}
                  sizes="(min-width: 1024px) 34vw, 70vw"
                  className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
                  style={{ objectPosition: p.hero.focal }}
                />
                {/* Story "unseen" segments */}
                <span className="absolute inset-x-2 top-2 flex gap-1 transition-opacity duration-500" style={{ opacity: on ? 1 : 0 }}>
                  {Array.from({ length: storyCount(p) }, (_, k) => (
                    <span key={k} className="h-[3px] flex-1 rounded-full" style={{ backgroundColor: p.theme.fg, opacity: 0.85 }} />
                  ))}
                </span>
                <span
                  className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 transition-opacity duration-500 lg:p-5"
                  style={{
                    opacity: on ? 1 : 0,
                    background: `linear-gradient(to top, ${p.theme.backdrop} 10%, transparent)`,
                  }}
                >
                  <span className="min-w-0">
                    <span className="block font-display text-[40px] leading-[0.85] font-black uppercase lg:text-[64px]">{p.name}</span>
                    <span className="mt-1 block truncate font-mono text-[10px] tracking-wider uppercase opacity-75 lg:text-[11px]">
                      {p.topic}
                    </span>
                  </span>
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ease-out-soft group-hover:scale-110 lg:size-12"
                    style={{ backgroundColor: p.theme.ctaBg, color: p.theme.ctaFg }}
                  >
                    <PlayIcon className="ml-0.5 size-3.5" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="anim-fade-up flex gap-3 [animation-delay:0.5s] lg:hidden">
          <HeroButtons tg={tgLink()} />
        </div>
      </div>
    </section>
  );
}

function HeroButtons({ tg }: { tg: string }) {
  return (
    <>
      <a
        href={tg}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-cta press inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full px-6 text-[16px] font-semibold [--cta-bg:#111214] [--cta-fg:#ffffff] lg:flex-none lg:px-8"
      >
        <PlaneIcon />
        Перейти в Telegram
      </a>
      <a
        href="#catalog"
        aria-label="Смотреть всех блогеров"
        className="btn-outline press inline-flex size-14 shrink-0 items-center justify-center gap-2 rounded-full text-[16px] font-semibold [--c-bg:#111214] [--c-fg:rgba(17,18,20,0.07)] sm:w-auto sm:px-7"
      >
        <span className="hidden sm:inline">Все блогеры</span>
        <ArrowDownIcon className="size-5" />
      </a>
    </>
  );
}
