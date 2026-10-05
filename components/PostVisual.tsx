"use client";

import Image from "next/image";
import { useState } from "react";
import type { Persona, Post } from "@/data/personas";
import { Avatar } from "./Avatar";
import { StoryZone } from "./StoryZone";

type Mode = "tile" | "story";
type P<K extends Post["kind"]> = { persona: Persona; post: Extract<Post, { kind: K }>; story: boolean };

const INK = "#111214";

/** Font size with a floor that only applies in landscape stories (--fmin is 0px everywhere else) */
const fs = (v: string) => `max(var(--fmin, 0px), ${v})`;
const PAPER = "#FAFAF9";

/**
 * One post, drawn in HTML from the persona's portrait and palette. Each post kind
 * has its own surface (photo, paper, ink data card, poster, photo + poll sticker),
 * so a feed reads as four different posts. Sizes are container units: the same
 * template works as a 4:5 feed tile and a 9:16 story.
 */
export function PostVisual({ persona, post, mode }: { persona: Persona; post: Post; mode: Mode }) {
  const story = mode === "story";
  switch (post.kind) {
    case "portrait":
      return <PhotoPost persona={persona} post={post} story={story} />;
    case "list":
      return <ListPost persona={persona} post={post} story={story} />;
    case "stats":
      return <StatsPost persona={persona} post={post} story={story} />;
    case "quote":
      return <QuotePost persona={persona} post={post} story={story} />;
    case "poll":
      return <PollPost persona={persona} post={post} story={story} />;
  }
}

/** Light surfaces need dark viewer chrome (header, caption) on top of them */
export function isLightSurface(persona: Persona, post: Post) {
  if (post.kind === "list") return true;
  if (post.kind === "quote") return persona.theme.fg === INK;
  return false;
}

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

function Frame({
  children,
  bg,
  color,
  story,
  className = "",
  backdrop,
}: {
  children: React.ReactNode;
  bg: string;
  color: string;
  story: boolean;
  className?: string;
  /** Decoration that spans the whole frame (not just the content zone) */
  backdrop?: React.ReactNode;
}) {
  // The container (.cq) is the outer box so cqw units resolve against the frame itself.
  // Tiles pad their content; stories place it inside the measured safe zone instead.
  return (
    <div className={`cq relative h-full w-full overflow-hidden ${className}`} style={{ backgroundColor: bg, color }}>
      {backdrop}
      {story ? (
        <StoryZone>{children}</StoryZone>
      ) : (
        <div className="relative flex h-full flex-col" style={{ padding: "calc(var(--u) * 7)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Byline({ persona, story, tone = "muted" }: { persona: Persona; story: boolean; tone?: string }) {
  if (story) return null; // the viewer already shows the author
  return (
    <div className="flex items-center" style={{ gap: "calc(var(--u) * 2.5)" }}>
      <Avatar persona={persona} className="" zoom={2} style={{ width: "calc(var(--u) * 12)", height: "calc(var(--u) * 12)" }} />
      <span className="font-mono tracking-wider uppercase" style={{ fontSize: fs("calc(var(--u) * 5)"), color: tone }}>
        @{persona.handle}
      </span>
    </div>
  );
}

function Kicker({ children, bg, fg, story }: { children: React.ReactNode; bg: string; fg: string; story: boolean }) {
  return (
    <span
      className="inline-flex w-fit items-center rounded-full font-mono tracking-wider uppercase"
      style={{ backgroundColor: bg, color: fg, fontSize: fs(story ? "calc(var(--u) * 3.4)" : "calc(var(--u) * 4.6)"), padding: story ? "calc(var(--u) * 1.6) calc(var(--u) * 3.2)" : "calc(var(--u) * 1.4) calc(var(--u) * 3)" }}
    >
      {children}
    </span>
  );
}

/* ---------- Photo: the portrait with an editorial headline ---------- */

function PhotoPost({ persona, post, story }: P<"portrait">) {
  const headline = (
    <>
      <Kicker bg="#fff" fg={INK} story={story}>
        Новый пост
      </Kicker>
      <p className="font-display leading-[0.88] font-black uppercase" style={{ fontSize: fs(story ? "calc(var(--u) * 12.5)" : "calc(var(--u) * 11.5)"), marginTop: "calc(var(--u) * 3)" }}>
        {post.headline}
      </p>
    </>
  );
  return (
    <div className="cq relative h-full w-full overflow-hidden text-white" style={{ backgroundColor: persona.theme.backdrop }}>
      <Image
        src={persona.hero.src}
        alt={persona.hero.alt}
        fill
        sizes={story ? "(min-width: 1024px) 480px, 100vw" : "(min-width: 1024px) 300px, 50vw"}
        className={`object-cover ${story ? "ken-burns" : ""}`}
        style={{ objectPosition: persona.hero.focal }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
      {story ? (
        <StoryZone>
          <div className="mt-auto">{headline}</div>
        </StoryZone>
      ) : (
        <div className="absolute inset-x-0 bottom-0" style={{ padding: "0 calc(var(--u) * 7) calc(var(--u) * 7)" }}>
          {headline}
        </div>
      )}
    </div>
  );
}

/* ---------- Paper: a numbered carousel cover ---------- */

function ListPost({ persona, post, story }: P<"list">) {
  const t = persona.theme;
  const shown = story ? post.items : post.items.slice(0, 2);
  const more = post.items.length - shown.length;
  return (
    <Frame bg={PAPER} color={INK} story={story}>
      <div className="flex items-start justify-between">
        <Byline persona={persona} story={story} tone="rgba(17,18,20,0.55)" />
        {story && (
          <Kicker bg={t.backdrop} fg={t.fg} story>
            Чек-лист
          </Kicker>
        )}
        {!story && <CarouselIcon />}
      </div>
      {story && (
        // The numeral is a decoration that takes whatever height the list leaves free
        // (size container => it adds nothing to the content height), so short screens
        // shrink the numeral instead of the list text.
        <div className="min-h-0 flex-1" style={{ containerType: "size", marginTop: "calc(var(--u) * 4)", marginBottom: "calc(var(--u) * 4)" }}>
          <div className="flex h-full items-start" style={{ gap: "calc(var(--u) * 3)" }}>
            <span className="font-display leading-[0.72] font-black" style={{ fontSize: fs("min(calc(var(--u) * 52), 135cqh)"), color: t.backdrop }}>
              {post.items.length}
            </span>
            <span className="font-mono uppercase" style={{ fontSize: fs("min(calc(var(--u) * 3.6), 22cqh)"), color: "rgba(17,18,20,0.55)", paddingTop: "min(calc(var(--u) * 2), 8cqh)" }}>
              {plural(post.items.length, "пункт", "пункта", "пунктов")}
              <br />
              сохраните себе
            </span>
          </div>
        </div>
      )}
      <div className="mt-auto">
        <p className="font-display leading-[0.9] font-black uppercase" style={{ fontSize: fs(story ? "calc(var(--u) * 11.5)" : "calc(var(--u) * 11)")}}>
          {post.title}
        </p>
        <ol style={{ marginTop: story ? "calc(var(--u) * 6)" : "calc(var(--u) * 4)" }}>
          {shown.map((item, i) => (
            <li
              key={item}
              className="flex items-center border-t border-black/10 leading-snug"
              style={{ gap: "calc(var(--u) * 3)", padding: story ? "calc(var(--u) * 3.4) 0" : "calc(var(--u) * 2.2) 0", fontSize: fs(story ? "calc(var(--u) * 4.8)" : "calc(var(--u) * 5.6)")}}
            >
              <span
                className="flex shrink-0 items-center justify-center rounded-full font-mono"
                style={{ backgroundColor: t.backdrop, color: t.fg, width: story ? "calc(var(--u) * 8)" : "calc(var(--u) * 8.5)", height: story ? "calc(var(--u) * 8)" : "calc(var(--u) * 8.5)", fontSize: fs(story ? "calc(var(--u) * 3.8)" : "calc(var(--u) * 4.4)")}}
              >
                {i + 1}
              </span>
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ol>
        {more > 0 && (
          <p className="border-t border-black/10 font-mono uppercase" style={{ fontSize: fs("calc(var(--u) * 4.4)"), paddingTop: "calc(var(--u) * 2.2)", color: "rgba(17,18,20,0.5)" }}>
            + ещё {more} в карусели →
          </p>
        )}
      </div>
    </Frame>
  );
}

/* ---------- Ink: a data card with one hero number ---------- */

function StatsPost({ persona, post, story }: P<"stats">) {
  const t = persona.theme;
  const [lead, ...rest] = post.stats;
  return (
    <Frame
      bg={INK}
      color="#fff"
      story={story}
      backdrop={
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "calc(var(--u) * 12.5) calc(var(--u) * 12.5)",
          }}
        />
      }
    >
      <div className="relative flex items-start justify-between">
        <Kicker bg={t.backdrop} fg={t.fg} story={story}>
          В цифрах
        </Kicker>
        {!story && <ChartIcon />}
      </div>
      <p className="relative font-display leading-[0.9] font-black uppercase" style={{ fontSize: fs(story ? "calc(var(--u) * 10.5)" : "calc(var(--u) * 10)"), marginTop: story ? "calc(var(--u) * 6)" : "calc(var(--u) * 4)" }}>
        {post.title}
      </p>
      <div className="relative mt-auto">
        <p className="font-display leading-[0.8] font-black" style={{ fontSize: fs(story ? "calc(var(--u) * 36)" : "calc(var(--u) * 40)"), color: t.onInk }}>
          {lead.value}
        </p>
        <p className="font-mono uppercase" style={{ fontSize: fs(story ? "calc(var(--u) * 3.6)" : "calc(var(--u) * 4.8)"), color: "rgba(255,255,255,0.6)", marginTop: "calc(var(--u) * 1.5)" }}>
          {lead.label}
        </p>
        {story && (
          <dl className="grid grid-cols-2" style={{ gap: "calc(var(--u) * 4)", marginTop: "calc(var(--u) * 7)" }}>
            {rest.map((s) => (
              <div key={s.label} className="border-t border-white/20" style={{ paddingTop: "calc(var(--u) * 2.5)" }}>
                <dd className="font-display leading-none font-black" style={{ fontSize: fs("calc(var(--u) * 11)")}}>
                  {s.value}
                </dd>
                <dt className="font-mono uppercase" style={{ fontSize: fs("calc(var(--u) * 3.2)"), color: "rgba(255,255,255,0.6)", marginTop: "calc(var(--u) * 1.5)" }}>
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Frame>
  );
}

/* ---------- Poster: a big quote on the persona's deep tone ---------- */

function QuotePost({ persona, post, story }: P<"quote">) {
  const t = persona.theme;
  return (
    <Frame bg={t.deep} color={t.fg} story={story}>
      <div className="flex items-start justify-between">
        <Kicker bg={t.fg} fg={t.deep} story={story}>
          Мысль дня
        </Kicker>
        {!story && <QuoteIcon />}
      </div>
      <div className="mt-auto">
        <p className="font-display leading-[0.55] font-black" style={{ fontSize: fs(story ? "calc(var(--u) * 40)" : "calc(var(--u) * 36)"), color: t.backdrop }} aria-hidden="true">
          “
        </p>
        <p className="font-display leading-[0.9] font-black uppercase" style={{ fontSize: fs(story ? "calc(var(--u) * 13.5)" : "calc(var(--u) * 12)")}}>
          {post.text}
        </p>
        <div className="flex items-center" style={{ gap: "calc(var(--u) * 3)", marginTop: story ? "calc(var(--u) * 7)" : "calc(var(--u) * 4)" }}>
          <Avatar persona={persona} className="" zoom={2} style={{ width: story ? "calc(var(--u) * 11)" : "calc(var(--u) * 12)", height: story ? "calc(var(--u) * 11)" : "calc(var(--u) * 12)", boxShadow: `0 0 0 calc(var(--u) * 0.6) ${t.fg}` }} />
          <span className="font-mono uppercase" style={{ fontSize: fs(story ? "calc(var(--u) * 3.6)" : "calc(var(--u) * 4.8)")}}>
            — {persona.name}
          </span>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- Photo + sticker: a toned close-up with a poll ---------- */

function PollPost({ persona, post, story }: P<"poll">) {
  const t = persona.theme;
  const [vote, setVote] = useState<number | null>(null);
  const sticker = (
    <div
      className="w-full bg-white text-ink shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)]"
      style={{ borderRadius: story ? "calc(var(--u) * 5)" : "calc(var(--u) * 5)", padding: story ? "calc(var(--u) * 5)" : "calc(var(--u) * 4.5)", transform: story ? "rotate(-2deg)" : undefined }}
    >
      <p className="font-mono uppercase" style={{ fontSize: fs(story ? "calc(var(--u) * 3.2)" : "calc(var(--u) * 4.2)"), color: "rgba(17,18,20,0.66)" }}>
        Опрос
      </p>
      <p className="font-display leading-[0.92] font-black uppercase" style={{ fontSize: fs(story ? "calc(var(--u) * 9.5)" : "calc(var(--u) * 9)"), marginTop: "calc(var(--u) * 1.5)" }}>
        {post.question}
      </p>
      <div className="grid" style={{ gap: story ? "calc(var(--u) * 2.4)" : "calc(var(--u) * 2)", marginTop: story ? "calc(var(--u) * 4)" : "calc(var(--u) * 3)" }}>
        {post.options.map((opt, i) => {
          const pct = post.result[i];
          const inner = (
            <>
              <span
                className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out-soft"
                // Light tint of the persona colour (ink text on it stays >= 7:1); the chosen option is a step stronger
                style={{ width: vote === null ? "0%" : `${pct}%`, backgroundColor: `color-mix(in srgb, ${t.backdrop} ${vote === i ? 40 : 20}%, white)` }}
              />
              <span className="relative flex w-full items-center justify-between font-medium">
                {opt}
                {vote !== null && <span className="font-mono">{pct}%</span>}
              </span>
            </>
          );
          const cls = "relative flex items-center overflow-hidden rounded-full border border-black/12 text-left";
          const style = {
            fontSize: fs(story ? "calc(var(--u) * 4.6)" : "calc(var(--u) * 5.2)"),
            padding: story ? "calc(var(--u) * 3.4) calc(var(--u) * 4.5)" : "calc(var(--u) * 2.2) calc(var(--u) * 4)",
            borderColor: vote === i ? "rgba(17,18,20,0.7)" : undefined,
          };
          return story ? (
            <button
              key={opt}
              type="button"
              data-no-nav
              disabled={vote !== null}
              onClick={() => setVote(i)}
              className={`${cls} transition-colors enabled:hover:border-black/40 enabled:hover:bg-black/[0.04]`}
              style={style}
            >
              {inner}
            </button>
          ) : (
            <span key={opt} className={cls} style={style}>
              {inner}
            </span>
          );
        })}
      </div>
      {story && vote !== null && (
        <p className="anim-fade-up font-mono uppercase" style={{ fontSize: fs("calc(var(--u) * 3.2)"), marginTop: "calc(var(--u) * 3)", color: "rgba(17,18,20,0.66)" }}>
          Спасибо! Голос учтён
        </p>
      )}
    </div>
  );
  return (
    <div className="cq relative h-full w-full overflow-hidden" style={{ backgroundColor: t.backdrop }}>
      {/* A tighter crop + colour wash so it never reads as the same photo as the portrait post */}
      <Image
        src={persona.hero.src}
        alt=""
        fill
        sizes={story ? "(min-width: 1024px) 480px, 100vw" : "(min-width: 1024px) 300px, 50vw"}
        className={`object-cover ${story ? "ken-burns" : ""}`}
        style={{ objectPosition: persona.hero.focal, transform: "scale(1.55)", transformOrigin: persona.hero.focal }}
      />
      <div className="absolute inset-0 mix-blend-multiply" style={{ backgroundColor: t.backdrop, opacity: 0.45 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
      {!story && (
        <span className="absolute text-white" style={{ top: "calc(var(--u) * 6)", right: "calc(var(--u) * 6)" }}>
          <PollIcon />
        </span>
      )}

      {story ? (
        <StoryZone inset="calc(var(--u) * 9)">
          <div className="mt-auto">{sticker}</div>
        </StoryZone>
      ) : (
        <div className="absolute inset-x-0 bottom-0 flex justify-center" style={{ padding: "0 calc(var(--u) * 6) calc(var(--u) * 6)" }}>
          {sticker}
        </div>
      )}
    </div>
  );
}

/* ---------- Post-type marks (feed tiles only) ---------- */

const markStyle = { width: "calc(var(--u) * 8)", height: "calc(var(--u) * 8)" };

function CarouselIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={markStyle} className="shrink-0 opacity-60">
      <rect x="3" y="7" width="13" height="14" rx="2.5" />
      <path d="M8 3h10.5A2.5 2.5 0 0 1 21 5.5V16" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={markStyle} className="shrink-0 opacity-70">
      <path d="M5 20V11M12 20V4M19 20v-6" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={markStyle} className="shrink-0 opacity-70">
      <path d="M10 7H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1.5A2.5 2.5 0 0 1 5.5 19H5v2h.5A4.5 4.5 0 0 0 10 16.5V7Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1.5a2.5 2.5 0 0 1-2.5 2.5H15v2h.5a4.5 4.5 0 0 0 4.5-4.5V7Z" />
    </svg>
  );
}

function PollIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={markStyle} className="block">
      <path d="M4 7h16M4 12h10M4 17h13" />
    </svg>
  );
}
