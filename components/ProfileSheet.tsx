"use client";

import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { personaById, type Persona, type Post } from "@/data/personas";
import { Avatar } from "./Avatar";
import { ChatDemo } from "./ChatDemo";
import { CloseIcon, PlaneIcon } from "./icons";
import { PostVisual } from "./PostVisual";
import { useShowcase } from "./showcase-context";

type Tab = "feed" | "chat";

const TABS: readonly (readonly [Tab, string])[] = [
  ["feed", "Лента"],
  ["chat", "Диалог"],
];

const KIND_LABEL: Record<Post["kind"], string> = {
  portrait: "Фото",
  list: "Карусель",
  stats: "Разбор",
  quote: "Цитата",
  poll: "Опрос",
};

/**
 * Mobile: bottom sheet (header → tabs → content → sticky CTA).
 * Desktop: a floating two-pane card — persona on the left, feed/chat on the right —
 * so wide screens don't stretch a phone layout into empty space.
 */
export function ProfileSheet() {
  const { profile, story, closeTop, restoreFocus } = useShowcase();
  // Keep rendering the last persona while the sheet animates out
  const last = useRef<Persona | null>(null);
  if (profile) last.current = personaById[profile];
  const p = last.current;

  const [tab, setTab] = useState<Tab>("feed");
  useEffect(() => {
    if (profile) setTab("feed");
  }, [profile]);

  const contentRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});

  // ARIA tabs: one tab stop (the selected tab); Left/Right (wrapping), Home and End move focus and select
  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = TABS.length - 1;
    const target =
      e.key === "ArrowRight" ? (index + 1) % TABS.length : e.key === "ArrowLeft" ? (index - 1 + TABS.length) % TABS.length : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (target === null) return;
    e.preventDefault();
    const [id] = TABS[target];
    setTab(id);
    tabRefs.current[id]?.focus();
  };

  // While stories play on top, the sheet must ignore outside clicks and Esc
  const guard = (e: Event) => {
    if (story) e.preventDefault();
  };

  return (
    <Drawer.Root open={!!profile} onOpenChange={(o) => !o && closeTop()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/45 lg:bg-black/55 lg:backdrop-blur-[2px]" />
        <Drawer.Content
          ref={contentRef}
          // Focus moves into the sheet on open and returns to the button that opened it on close
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            contentRef.current?.focus({ preventScroll: true });
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            if (p) restoreFocus("profile", p.id);
          }}
          onPointerDownOutside={guard}
          onInteractOutside={guard}
          onFocusOutside={guard}
          onEscapeKeyDown={guard}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[92dvh] max-w-[720px] flex-col overflow-hidden rounded-t-[28px] bg-sheet outline-none lg:bottom-[5vh] lg:h-[min(88vh,800px)] lg:max-w-[1040px] lg:flex-row lg:rounded-[28px] lg:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)]"
        >
          {p && (
            <>
              <header
                className="relative shrink-0 px-5 pt-3 pb-4 lg:flex lg:w-[360px] lg:flex-col lg:overflow-y-auto lg:p-8"
                style={{ backgroundColor: p.theme.backdrop, color: p.theme.fg }}
              >
                <Drawer.Handle className="!mx-auto !mb-4 !h-1.5 !w-12 !rounded-full !opacity-40 lg:!hidden" style={{ backgroundColor: p.theme.fg }} />
                <div className="flex items-start gap-4 lg:flex-col lg:gap-5">
                  <Avatar persona={p} className="size-16 shadow-[0_0_0_3px_currentColor] lg:size-24" />
                  <div className="min-w-0 flex-1">
                    <Drawer.Title className="font-display text-[44px] leading-[0.85] font-black uppercase lg:text-[76px]">{p.name}</Drawer.Title>
                    <p className="mt-1 font-mono text-[12px] lg:mt-2" style={{ color: p.theme.muted }}>
                      @{p.handle} · ИИ-персонаж
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeTop}
                    aria-label="Закрыть профиль"
                    title="Закрыть"
                    className="btn-ghost press -mt-1 -mr-2 flex size-11 items-center justify-center rounded-full lg:absolute lg:top-5 lg:right-5 lg:m-0"
                  >
                    <CloseIcon />
                  </button>
                </div>

                {/* On phones the bio folds away in the chat tab to leave room for the conversation */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-400 ease-out-soft lg:grid-rows-[1fr] lg:opacity-100 ${
                    tab === "feed" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <Drawer.Description className="mt-4 text-[15px] leading-snug lg:mt-6 lg:text-[16px]">{p.bio}</Drawer.Description>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {p.tags.map((tag) => (
                        <li key={tag} className="rounded-full px-3 py-1 text-[13px] font-medium" style={{ backgroundColor: p.theme.deep }}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <dl className="mt-8 hidden grid-cols-3 gap-3 lg:grid">
                  {p.stats.map((s) => (
                    <div key={s.label} className="flex flex-col-reverse border-t pt-2.5" style={{ borderColor: p.theme.muted }}>
                      <dt className="mt-1.5 min-h-[2.5em] font-mono text-[10px] leading-[1.25] tracking-wide uppercase" style={{ color: p.theme.muted }}>
                        {s.label}
                      </dt>
                      <dd className="font-display text-[28px] leading-none font-black whitespace-nowrap">{s.value}</dd>
                    </div>
                  ))}
                </dl>

                <TelegramCta persona={p} className="mt-auto hidden pt-8 lg:block" onBackdrop />
              </header>

              <div className="flex min-h-0 flex-1 flex-col">
                <div role="tablist" aria-label="Разделы профиля" className="flex shrink-0 gap-1 border-b border-line px-5 pt-3 lg:px-8 lg:pt-5">
                  {TABS.map(([id, label], i) => {
                    const selected = tab === id;
                    return (
                      <button
                        key={id}
                        ref={(el) => {
                          tabRefs.current[id] = el;
                        }}
                        id={`tab-${id}`}
                        role="tab"
                        type="button"
                        aria-selected={selected}
                        aria-controls={selected ? `panel-${id}` : undefined}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setTab(id)}
                        onKeyDown={(e) => onTabKeyDown(e, i)}
                        className={`relative h-11 rounded-t-lg px-4 text-[15px] font-semibold transition-colors ${
                          selected ? "text-ink" : "text-ink/65 hover:bg-black/[0.04] hover:text-ink"
                        }`}
                      >
                        {label}
                        <span
                          className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-ink transition-transform duration-300"
                          style={{ transform: selected ? "scaleX(1)" : "scaleX(0)" }}
                        />
                      </button>
                    );
                  })}
                </div>

                <div
                  key={tab}
                  id={`panel-${tab}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${tab}`}
                  className="anim-tab min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 lg:px-8 lg:py-6"
                  data-vaul-no-drag
                >
                  {tab === "feed" ? <Feed persona={p} /> : <ChatDemo key={p.id} persona={p} />}
                </div>

                <div
                  className="shrink-0 border-t border-line bg-sheet px-4 pt-3 lg:hidden"
                  style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
                >
                  <TelegramCta persona={p} />
                </div>
              </div>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Feed({ persona: p }: { persona: Persona }) {
  const { openStories } = useShowcase();
  return (
    <ul className="grid grid-cols-2 gap-x-2.5 gap-y-5 lg:gap-x-4">
      {p.posts.map((post, i) => (
        <li key={post.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
          <button
            type="button"
            onClick={() => openStories(p.id, i)}
            className="group press relative block aspect-[4/5] w-full overflow-hidden rounded-2xl text-left shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-[0_14px_30px_-14px_rgba(0,0,0,0.45)] hover:ring-2 hover:ring-ink"
            aria-label={`Открыть публикацию: ${post.caption}`}
          >
            <span className="block h-full w-full transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]">
              <PostVisual persona={p} post={post} mode="tile" />
            </span>
          </button>
          <p className="mt-2.5 line-clamp-2 text-[13px] leading-snug text-ink/80">{post.caption}</p>
          <p className="mt-1 font-mono text-[10px] tracking-wider text-ink/45 uppercase">
            {KIND_LABEL[post.kind]} · {post.ago} назад
          </p>
        </li>
      ))}
    </ul>
  );
}

function TelegramCta({ persona: p, className = "", onBackdrop = false }: { persona: Persona; className?: string; onBackdrop?: boolean }) {
  const { tgLink } = useShowcase();
  // On the coloured pane use the persona's CTA colours; on the light sheet always ink
  const vars = (onBackdrop ? { "--cta-bg": p.theme.ctaBg, "--cta-fg": p.theme.ctaFg } : { "--cta-bg": "#111214", "--cta-fg": "#ffffff" }) as React.CSSProperties;
  return (
    <div className={className}>
      <a
        href={tgLink(p.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-cta press flex h-14 items-center justify-center gap-3 rounded-full text-[16px] font-semibold"
        style={vars}
      >
        <span
          className="flex size-8 items-center justify-center rounded-full"
          style={{ backgroundColor: p.theme.backdrop, color: p.theme.fg }}
        >
          <PlaneIcon className="size-4" />
        </span>
        Перейти в Telegram
      </a>
    </div>
  );
}
