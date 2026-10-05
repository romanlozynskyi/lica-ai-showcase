"use client";

import { personaById, personas } from "@/data/personas";
import { Avatar } from "./Avatar";
import { PlaneIcon } from "./icons";
import { Reveal } from "./Reveal";
import { useShowcase } from "./showcase-context";

const mira = personaById.mira;
const leo = personaById.leo;

const steps = [
  {
    title: "Выберите блогера",
    text: "Посмотрите истории, полистайте ленту и попробуйте демо-диалог — так проще понять, чей голос вам ближе.",
    visual: <PickVisual />,
  },
  {
    title: "Откройте чат в Telegram",
    text: "Одна кнопка — и вы в личном чате с выбранным персонажем. Без регистрации и новых приложений.",
    visual: <StartVisual />,
  },
  {
    title: "Общайтесь в любое время",
    text: "Блогеры отвечают 24/7, присылают новые посты и помнят, о чём вы говорили.",
    visual: <NightVisual />,
  },
];

export function HowItWorks() {
  return (
    <section id="how" data-tone="how" className="scroll-mt-14 bg-studio px-4 pt-16 pb-20 lg:px-8 lg:pt-20 lg:pb-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.08em] text-ink/60 uppercase">Три шага до диалога</p>
            <h2 className="mt-3 font-display text-[clamp(52px,15vw,128px)] leading-[0.84] font-black uppercase">
              Как это
              <br />
              работает
            </h2>
          </Reveal>
          <Reveal as="p" index={1} className="mt-5 max-w-[34ch] text-[17px] leading-snug text-ink/70 lg:mt-0 lg:mb-2 lg:text-lg">
            От первого взгляда до личного чата — меньше минуты. Всё общение происходит в Telegram.
          </Reveal>
        </div>

        {/*
          Every step is the same four slots: numeral / title / text / media.
          Desktop: the three <li> share one subgrid, so each slot starts at the same height
          in every column. Phones: each slot reserves the same height (2-line title,
          4-line text, fixed media card) so the steps stack with identical rhythm.
        */}
        <ol className="mt-8 grid lg:mt-12 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_auto] lg:gap-x-6">
          {steps.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              index={i}
              stagger="desktop"
              className="grid grid-cols-[64px_1fr] gap-x-4 border-t border-ink/15 py-5 max-[359px]:grid-cols-[44px_1fr] max-[359px]:gap-x-3 lg:row-span-4 lg:grid-cols-1 lg:grid-rows-subgrid lg:gap-x-0 lg:border-t-2 lg:border-ink lg:py-0 lg:pt-6"
            >
              <span
                className="col-start-1 row-span-3 row-start-1 font-display text-[72px] leading-[0.72] font-black max-[359px]:text-[56px] lg:row-span-1 lg:text-[112px]"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <h3 className="col-start-2 row-start-1 min-h-[2.5em] text-[22px] leading-tight font-semibold lg:col-start-1 lg:row-start-2 lg:mt-6 lg:min-h-0 lg:text-[26px]">
                <span className="sr-only">Шаг {i + 1}. </span>
                {s.title}
              </h3>
              <p className="col-start-2 row-start-2 mt-2 min-h-[5.5em] text-[15px] leading-snug text-ink/70 max-[359px]:min-h-[6.875em] lg:col-start-1 lg:row-start-3 lg:min-h-0 lg:text-base">
                {s.text}
              </p>
              <div className="col-start-2 row-start-3 mt-4 h-[140px] max-[359px]:h-[168px] lg:col-start-1 lg:row-start-4 lg:mt-6 lg:h-[148px]" aria-hidden="true">
                {s.visual}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* Media slot: three illustrations built from the real personas — decorative only.
   Each one fills the same fixed-height card, content centred inside it. */

const slot = "flex h-full w-full max-w-[420px] flex-col justify-center overflow-hidden rounded-[20px] p-3";

function PickVisual() {
  return (
    <div className={`${slot} items-center gap-3 bg-sheet`}>
      <div className="flex -space-x-3">
        {personas.map((p) => (
          <Avatar key={p.id} persona={p} className="size-12 ring-4 ring-sheet" zoom={1.8} />
        ))}
      </div>
      <span className="font-mono text-[11px] tracking-wider text-ink/55 uppercase">4 характера на выбор</span>
    </div>
  );
}

function StartVisual() {
  return (
    // gap-3 guarantees clear space between the divider and the /start pill at every size
    <div className={`${slot} justify-between gap-3 bg-sheet`}>
      <div className="flex shrink-0 items-center gap-2 border-b border-line pb-2">
        <Avatar persona={mira} className="size-7" />
        <div className="leading-tight">
          <p className="text-[13px] font-semibold">{mira.name}</p>
          <p className="font-mono text-[10px] text-ink/50 uppercase">в сети</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-[13px]">
        <span className="self-end rounded-2xl rounded-br-md bg-ink px-3 py-1.5 font-mono text-white">/start</span>
        <span className="max-w-[85%] rounded-2xl rounded-bl-md px-3 py-1.5" style={{ backgroundColor: mira.theme.backdrop, color: mira.theme.fg }}>
          Привет! Я Мира.
        </span>
      </div>
    </div>
  );
}

function NightVisual() {
  return (
    <div className={`${slot} gap-2 bg-ink text-white`}>
      <span className="self-end rounded-2xl rounded-br-md bg-white/15 px-3 py-1.5 text-[13px]">
        Не спится. Что почитать про продукт?
        <span className="ml-2 font-mono text-[10px] text-white/50">03:12</span>
      </span>
      <span className="flex max-w-[85%] items-end gap-1.5 text-[13px]">
        <Avatar persona={leo} className="size-6" />
        <span className="rounded-2xl rounded-bl-md px-3 py-1.5" style={{ backgroundColor: leo.theme.backdrop, color: leo.theme.fg }}>
          «Shape Up» — коротко и по делу.
          <span className="ml-2 font-mono text-[10px] opacity-60">03:12</span>
        </span>
      </span>
    </div>
  );
}

export function FinalCta() {
  const { tgLink } = useShowcase();
  return (
    <section id="contact" data-tone="final" className="scroll-mt-14 bg-ink px-4 pt-20 pb-10 text-white lg:px-8 lg:pt-28">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.08em] text-white/55 uppercase">Все четверо уже в Telegram</p>
          <h2 className="mt-3 font-display text-[clamp(60px,19vw,180px)] leading-[0.82] font-black uppercase">
            С кем
            <br />
            поговорим?
          </h2>
        </Reveal>

        <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div>
            <Reveal as="p" className="text-[15px] text-white/70">
              Нажмите на блогера — откроется личный чат с ним.
            </Reveal>
            <ul className="mt-5 grid grid-cols-4 gap-2 sm:max-w-[560px] lg:gap-5">
              {personas.map((p, i) => (
                <Reveal as="li" key={p.id} index={i + 1}>
                  <a
                    href={tgLink(p.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Открыть чат с блогером ${p.name} в Telegram`}
                    className="press group flex flex-col items-center gap-2 rounded-2xl p-1 transition-colors hover:bg-white/[0.06]"
                  >
                    <span className="relative w-full max-w-[104px]">
                      <Avatar
                        persona={p}
                        className="aspect-square h-auto w-full ring-0 ring-white/80 transition-[box-shadow,transform] duration-300 ease-out-soft group-hover:-translate-y-1 group-hover:ring-2"
                        zoom={1.7}
                      />
                      <span
                        className="absolute -right-0.5 -bottom-0.5 flex size-7 items-center justify-center rounded-full ring-4 ring-ink transition-transform duration-300 ease-out-soft group-hover:scale-110"
                        style={{ backgroundColor: p.theme.backdrop, color: p.theme.fg }}
                      >
                        <PlaneIcon className="size-3.5" />
                      </span>
                    </span>
                    <span className="text-[14px] font-semibold">{p.name}</span>
                    <span className="-mt-1.5 font-mono text-[10px] tracking-wider text-white/45 uppercase transition-colors group-hover:text-white/80">
                      Чат
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal index={2} className="mt-10 border-t border-white/15 pt-8 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-16">
            <p className="text-[15px] text-white/70">Ещё не решили? Начните с общего бота — выбрать блогера можно уже в Telegram.</p>
            <a
              href={tgLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta press mt-5 flex h-16 w-full items-center justify-center gap-3 rounded-full px-10 text-[18px] font-semibold [--cta-bg:#ffffff] [--cta-fg:#111214] sm:w-auto sm:max-w-[420px]"
            >
              <PlaneIcon />
              Перейти в Telegram
            </a>
          </Reveal>
        </div>

        <Reveal as="footer" className="mt-20 flex flex-col gap-3 border-t border-white/15 pt-6 text-[13px] leading-snug text-white/55 lg:flex-row lg:justify-between">
          <p>
            <span className="font-display text-[18px] font-black text-white uppercase">лица</span>
            <span className="font-mono text-[11px] text-white">.ai</span> — демо-витрина ИИ-блогеров.
          </p>
          <p className="max-w-[60ch]">
            Все персонажи, их внешность, публикации и диалоги созданы нейросетями. Любые совпадения с реальными людьми случайны.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
