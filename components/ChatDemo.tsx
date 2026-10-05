"use client";

import { useEffect, useRef, useState } from "react";
import type { Persona } from "@/data/personas";
import { Avatar } from "./Avatar";
import { PlaneIcon } from "./icons";
import { useShowcase } from "./showcase-context";

type Msg = { id: number; from: "them" | "me" | "handoff"; text: string };

const typingTime = (text: string) => Math.min(1400, 450 + text.length * 14);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ChatDemo({ persona: p }: { persona: Persona }) {
  const { tgLink } = useShowcase();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [used, setUsed] = useState<string[]>([]);
  const busy = useRef(false);
  // Bumped on unmount so in-flight typing sequences stop (also covers StrictMode double effects)
  const gen = useRef(0);
  const nextId = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  const push = (from: Msg["from"], text: string) =>
    setMessages((m) => [...m, { id: nextId.current++, from, text }]);

  const say = async (lines: string[]) => {
    const g = gen.current;
    for (const line of lines) {
      setTyping(true);
      await sleep(typingTime(line));
      if (gen.current !== g) return false;
      setTyping(false);
      push("them", line);
      await sleep(250);
    }
    return gen.current === g;
  };

  useEffect(() => {
    busy.current = true;
    say([p.chat.greeting]).then((ok) => {
      if (ok) busy.current = false;
    });
    return () => {
      gen.current += 1;
    };
  }, [p.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  const ask = async (chip: string, answer: string[]) => {
    if (busy.current) return;
    busy.current = true;
    const nowUsed = [...used, chip];
    setUsed(nowUsed);
    push("me", chip);
    await sleep(350);
    if (!(await say(answer))) return;
    if (nowUsed.length === 2) {
      await sleep(300);
      push("handoff", p.chat.handoff);
    }
    busy.current = false;
  };

  const left = p.chat.replies.filter((r) => !used.includes(r.chip));

  return (
    // Messages sit at the bottom, next to the reply chips, like a messenger.
    // On wide screens the free space above holds the bot's intro card.
    <div className="flex min-h-full flex-col justify-end">
      <div className="mx-auto mb-auto hidden w-full max-w-[420px] flex-col items-center pb-8 text-center lg:flex">
        <Avatar persona={p} className="size-20" zoom={1.7} />
        <p className="mt-3 font-display text-[36px] leading-none font-black uppercase">{p.name}</p>
        <p className="mt-1 font-mono text-[11px] tracking-wider text-ink/50 uppercase">
          @{p.handle} · {p.topic}
        </p>
        <p className="mt-3 text-[14px] leading-snug text-ink/65">
          Задайте один из вопросов ниже — {p.name} ответит в своём стиле. В Telegram можно спрашивать о чём угодно.
        </p>
        <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
          {p.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-black/[0.05] px-3 py-1 text-[12px] font-medium text-ink/70">
              {tag}
            </li>
          ))}
        </ul>
      </div>
      <p className="mx-auto mb-4 rounded-full bg-black/5 px-3 py-1 font-mono text-[10px] tracking-wider text-ink/55 uppercase">
        Демо-диалог · ответы по сценарию
      </p>

      <ol className="flex flex-col gap-2" aria-live="polite">
        {messages.map((m) =>
          m.from === "handoff" ? (
            <li key={m.id} className="anim-bubble mt-2 rounded-3xl p-4" style={{ backgroundColor: p.theme.backdrop, color: p.theme.fg }}>
              <p className="text-[15px] leading-snug">{m.text}</p>
              <a
                href={tgLink(p.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta press mt-3 flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold"
                style={{ "--cta-bg": p.theme.ctaBg, "--cta-fg": p.theme.ctaFg } as React.CSSProperties}
              >
                <PlaneIcon className="size-4" />
                Продолжить в Telegram
              </a>
            </li>
          ) : (
            <li key={m.id} className={`anim-bubble flex items-end gap-2 ${m.from === "me" ? "justify-end" : ""}`}>
              {m.from === "them" && <Avatar persona={p} className="size-7" />}
              <p
                className={`max-w-[80%] rounded-[20px] px-4 py-2.5 text-[15px] leading-snug ${
                  m.from === "me" ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-white text-ink shadow-[0_1px_0_rgba(0,0,0,0.06)]"
                }`}
              >
                {m.text}
              </p>
            </li>
          ),
        )}
        {typing && (
          <li className="flex items-end gap-2" aria-label={`${p.name} печатает`}>
            <Avatar persona={p} className="size-7" />
            <span className="flex gap-1 rounded-[20px] rounded-bl-md bg-white px-4 py-3.5">
              <span className="typing-dot size-1.5 rounded-full bg-ink" />
              <span className="typing-dot size-1.5 rounded-full bg-ink" />
              <span className="typing-dot size-1.5 rounded-full bg-ink" />
            </span>
          </li>
        )}
      </ol>

      {left.length > 0 && used.length < 2 && (
        <div className="flex flex-wrap justify-end gap-2 pt-5">
          {left.map((r) => (
            <button
              key={r.chip}
              type="button"
              onClick={() => ask(r.chip, r.answer)}
              className="btn-outline press rounded-full bg-sheet px-4 py-2.5 text-left text-[14px] font-medium [--c-bg:#ffffff] [--c-fg:#111214]"
            >
              {r.chip}
            </button>
          ))}
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
