"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { personaById, personas } from "@/data/personas";
import { Avatar } from "./Avatar";
import { ChevronIcon, CloseIcon, PlaneIcon } from "./icons";
import { isLightSurface, PostVisual } from "./PostVisual";
import { StoryZone } from "./StoryZone";
import { useShowcase } from "./showcase-context";

const SLIDE_MS = 5500;
const HOLD_MS = 180;

export function StoryViewer() {
  const { story, setStory, closeTop, openProfile, profile, tgLink } = useShowcase();
  const [held, setHeld] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [dragY, setDragY] = useState(0);
  const press = useRef<{ x: number; y: number; t: number; holdTimer: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  const p = story ? personaById[story.persona] : null;
  const total = p ? p.posts.length + 1 : 0; // + closing CTA slide
  const index = story?.index ?? 0;
  const isCta = p ? index === p.posts.length : false;

  const next = useCallback(() => {
    if (!story || !p) return;
    if (story.index < total - 1) return setStory({ persona: story.persona, index: story.index + 1 });
    const i = personas.findIndex((x) => x.id === story.persona);
    if (i < personas.length - 1) setStory({ persona: personas[i + 1].id, index: 0 });
    else closeTop();
  }, [story, p, total, setStory, closeTop]);

  const prev = useCallback(() => {
    if (!story) return;
    if (story.index > 0) return setStory({ persona: story.persona, index: story.index - 1 });
    const i = personas.findIndex((x) => x.id === story.persona);
    if (i > 0) setStory({ persona: personas[i - 1].id, index: personas[i - 1].posts.length });
  }, [story, setStory]);

  useEffect(() => {
    if (!story) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeTop();
      } else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") {
        e.preventDefault();
        setHeld((h) => !h);
      }
    };
    window.addEventListener("keydown", onKey, true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
    };
  }, [story, next, prev, closeTop]);

  // Publish the real header / footer heights so slide content keeps clear of both.
  // Slides read them as --safe-top / --safe-bottom (see StoryZone).
  const slideKey = story ? `${story.persona}:${story.index}` : "";
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const GAP_TOP = 14;
    const GAP_BOTTOM = 18;
    const measure = () => {
      const top = headerRef.current?.offsetHeight ?? 0;
      const bottom = footerRef.current?.offsetHeight ?? 0;
      frame.style.setProperty("--safe-top", `${top + GAP_TOP}px`);
      // No footer on the closing slide: keep a calm margin above the home indicator instead
      frame.style.setProperty("--safe-bottom", bottom ? `${bottom + GAP_BOTTOM}px` : "max(28px, env(safe-area-inset-bottom))");
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    if (footerRef.current) ro.observe(footerRef.current);
    return () => ro.disconnect();
  }, [slideKey]);

  if (!story || !p) return null;

  const paused = held || reduced || isCta;

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-nav]")) return;
    const holdTimer = window.setTimeout(() => setHeld(true), HOLD_MS);
    press.current = { x: e.clientX, y: e.clientY, t: Date.now(), holdTimer };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!press.current) return;
    const dy = e.clientY - press.current.y;
    if (dy > 8) {
      clearTimeout(press.current.holdTimer);
      setHeld(true);
      setDragY(dy);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const start = press.current;
    press.current = null;
    if (!start) return;
    clearTimeout(start.holdTimer);
    const dy = e.clientY - start.y;
    setDragY(0);
    setHeld(false);
    if (dy > 90) return closeTop();
    if (Date.now() - start.t > HOLD_MS || Math.abs(dy) > 12) return; // was a hold or a drag
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.clientX - rect.left < rect.width / 3) prev();
    else next();
  };

  const post = p.posts[index];
  // Paper / light-poster slides get dark chrome so the header and caption stay legible
  const light = post ? isLightSurface(p, post) : p.theme.fg === "#111214";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Истории: ${p.name}`}
      className="pointer-events-auto fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && closeTop()}
    >
      <div className="relative w-full lg:w-auto">
      <div
        key={p.id}
        ref={frameRef}
        className="anim-viewer relative h-[100dvh] cursor-pointer w-full touch-none overflow-hidden select-none lg:aspect-[9/16] lg:h-[min(92vh,880px)] lg:w-auto lg:rounded-[24px]"
        style={{
          backgroundColor: p.theme.backdrop,
          transform: dragY ? `translateY(${dragY}px) scale(${1 - Math.min(dragY, 300) / 1500})` : undefined,
          borderRadius: dragY ? 24 : undefined,
          transition: dragY ? "none" : "transform 0.3s",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          press.current = null;
          setHeld(false);
          setDragY(0);
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* keyed per slide so each one eases in instead of hard-cutting */}
        <div key={`${p.id}-${index}`} className="anim-slide absolute inset-0">
          {isCta ? (
            ctaSlide()
          ) : (
            <PostVisual key={post.id} persona={p} post={post} mode="story" />
          )}
        </div>

        {/* Top: progress + author */}
        <div ref={headerRef} className={`absolute inset-x-0 top-0 isolate px-3 pt-[max(10px,env(safe-area-inset-top))] transition-colors duration-300 ${light ? "text-ink" : "text-white"}`}>
          {/* scrim sits behind the content and is not part of the measured height */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 top-0 -bottom-8 -z-10 bg-gradient-to-b to-transparent ${light ? "from-white/0" : "from-black/35"}`}
          />
          <div className="flex gap-1">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={`h-[3px] flex-1 overflow-hidden rounded-full transition-colors duration-300 ${light ? "bg-black/15" : "bg-white/35"}`}>
                {(i < index || (i === index && isCta)) && <span className={`block h-full w-full ${light ? "bg-ink" : "bg-white"}`} />}
                {i === index && !isCta && (
                  <span
                    key={`${p.id}-${index}`}
                    className={`story-bar-fill block h-full w-full ${light ? "bg-ink" : "bg-white"}`}
                    style={{
                      animationDuration: `${SLIDE_MS}ms`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                    onAnimationEnd={next}
                  />
                )}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <Avatar persona={p} className={`size-9 ring-2 ${light ? "ring-ink/80" : "ring-white/80"}`} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[14px] font-semibold">{p.name}</p>
              <p className="font-mono text-[11px] opacity-75">
                @{p.handle} {post ? `· ${post.ago}` : ""}
              </p>
            </div>
            {held && !dragY && <span className="font-mono text-[10px] tracking-wider uppercase opacity-80">пауза</span>}
            <button
              ref={closeRef}
              type="button"
              data-no-nav
              onClick={closeTop}
              aria-label="Закрыть истории"
              title="Закрыть"
              className="btn-ghost flex size-11 items-center justify-center rounded-full"
            >
              <CloseIcon className="size-6" />
            </button>
          </div>
        </div>

        {/* Bottom: caption + actions */}
        {!isCta && post && (
          <div
            ref={footerRef}
            className={`absolute inset-x-0 bottom-0 isolate px-4 pb-[max(16px,env(safe-area-inset-bottom))] transition-colors duration-300 ${light ? "text-ink" : "text-white"}`}
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 bottom-0 -top-14 -z-10 bg-gradient-to-t to-transparent ${light ? "from-white/0" : "from-black/55"}`}
            />
            <p className="line-clamp-3 text-[15px] leading-snug">{post.caption}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                data-no-nav
                onClick={() => (profile === p.id ? closeTop() : openProfile(p.id, true))}
                className={`press h-11 flex-1 rounded-full text-[14px] font-semibold backdrop-blur-md transition-colors ${
                  light ? "bg-black/[0.07] hover:bg-black/15" : "bg-white/15 hover:bg-white/30"
                }`}
              >
                Открыть профиль
              </button>
              <a
                data-no-nav
                href={tgLink(p.id)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Написать ${p.nameDative} в Telegram`}
                className={`press flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-colors ${
                  light ? "bg-ink text-white hover:bg-ink/80" : "bg-white text-ink hover:bg-white/80"
                }`}
              >
                <PlaneIcon className="size-4" />
                Написать
              </a>
            </div>
          </div>
        )}

      </div>
        {/* Desktop arrows */}
      <button
        type="button"
        data-no-nav
        onClick={prev}
        aria-label="Предыдущая история"
        className="absolute top-1/2 -left-16 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/35 lg:flex"
      >
        <ChevronIcon dir="left" />
      </button>
      <button
        type="button"
        data-no-nav
        onClick={next}
        aria-label="Следующая история"
        className="absolute top-1/2 -right-16 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/35 lg:flex"
      >
        <ChevronIcon dir="right" />
      </button>
      </div>
    </div>,
    document.body,
  );

  function ctaSlide() {
    const t = p!.theme;
    return (
      <div className="cq relative h-full w-full" style={{ backgroundColor: t.backdrop, color: t.fg }}>
        <StoryZone align="center">
          <div className="flex flex-col items-center text-center">
            <Avatar persona={p!} className="anim-pop size-28" zoom={1.7} style={{ boxShadow: `0 0 0 4px ${t.fg}` }} />
            <p className="anim-fade-up mt-6 font-display text-[15cqw] leading-[0.88] font-black uppercase [animation-delay:0.1s]">
              Продолжим в&nbsp;Telegram?
            </p>
            <p className="anim-fade-up mt-4 max-w-[28ch] text-[16px] leading-snug [animation-delay:0.15s]" style={{ color: t.muted }}>
              Там {p!.name} отвечает лично — в любое время.
            </p>
            <a
              data-no-nav
              href={tgLink(p!.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta press anim-fade-up mt-8 flex h-14 w-full max-w-[320px] items-center justify-center gap-2 rounded-full text-[16px] font-semibold [animation-delay:0.2s]"
              style={{ "--cta-bg": t.ctaBg, "--cta-fg": t.ctaFg } as React.CSSProperties}
            >
              <PlaneIcon />
              Перейти в Telegram
            </a>
            <button
              type="button"
              data-no-nav
              onClick={() => (profile === p!.id ? closeTop() : openProfile(p!.id, true))}
              className="anim-fade-up mt-3 h-11 rounded-full px-4 text-[15px] font-semibold underline underline-offset-4 transition-opacity hover:opacity-70 [animation-delay:0.25s]"
            >
              Открыть профиль
            </button>
          </div>
        </StoryZone>
      </div>
    );
  }
}
