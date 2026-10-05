# лица.ai — AI Blogger Showcase: Design Spec

Source brief: `задача 2 аватары блогеров.docx`. The brief asks for a mobile-first landing page that presents four AI bloggers (2 male, 2 female). It needs AI-generated portraits, blogger cards, an interaction mechanic, and a prominent "Перейти в Telegram" CTA. There is no backend. The deliverables are a deployed URL and a GitHub repo.

The UI language is Russian because the brief is in Russian. No persona is given a nationality, ethnicity, or home country, and the content names no real-world locations. Personas are described only by appearance, style, and topic.

---

## 1. How the brief's criteria are addressed

| Criterion | Approach |
|---|---|
| Commercial look | One specific visual idea ("Seamless paper", §3) instead of generic AI-startup gradients. Real copy throughout. |
| Character quality | Four provided studio portraits are the fixed source of truth. Each is shot on a solid backdrop, and the page uses that same color, so the portrait dissolves into the layout. |
| Mobile UX | One-thumb layout, a contextual sticky Telegram bar, a bottom-sheet profile, 44px+ tap targets, safe-area insets. |
| Product feel | Stories viewer → profile sheet (feed + scripted chat) → Telegram deep link with persona and traffic-source tracking. |
| Autonomy / speed | Static data in one typed file. No backend. |

## 2. Stack

- Next.js 16 (App Router, static) with TypeScript, Tailwind CSS v4, `vaul` (bottom sheet), and `next/font` (Cyrillic subsets). Deploys to Vercel.
- All content lives in `data/personas.ts`. The Telegram link builder is in `lib/telegram.ts`.

```
app/            layout (fonts, metadata, OG), page, globals.css (tokens + motion), icon.svg
components/     showcase-context (overlay state, hash routing, utm source)
                Chrome (header + sticky Telegram bar, tone tracking, theme-color)
                Hero (story strip), PersonaCard, ProfileSheet, ChatDemo,
                StoryViewer, PostVisual, Avatar, Sections (how it works, final CTA, footer)
data/personas.ts
lib/telegram.ts
public/personas/{leo,max,mira,sophie}/hero.png   (provided portraits, unmodified)
public/og.jpg
```

## 3. Visual direction: "Seamless paper"

The page reads as a casting book from a photo studio. Each character is shot against their own roll of seamless paper backdrop. Each persona's section uses the color sampled from their portrait, and the portrait's edges are masked so the person appears to stand *in* the page. The header, the sticky bar, and the browser `theme-color` follow whichever character is on screen.

| Token | Hex | Use |
|---|---|---|
| studio | `#E8E9EB` | Base page (cool neutral) |
| ink | `#111214` | Text, primary CTA on light backdrops |
| sheet | `#FAFAF9` | Profile sheet, chat |
| Leo — cobalt | `#0644AC` | Sampled from portrait. White text. |
| Max — moss | `#636339` | Sampled from portrait. White text. |
| Mira — lilac | `#AB9BDA` | Sampled from portrait. Ink text. |
| Sophie — butter | `#F4CB6F` | Sampled from portrait. Ink text. |

The Telegram CTA is always the maximum-contrast pill against the current backdrop, never Telegram blue.

| Role | Face |
|---|---|
| Display | Sofia Sans Extra Condensed 800/900. Huge uppercase names, the hero line, post titles. |
| Body / UI | Onest 400–600 |
| Utility | JetBrains Mono 500. Handles, tags, the "ИИ-персонаж" badge, timestamps. |

Motion is limited to five places: the hero line reveal and the ambient rotation of the story strip; the name reveal on each card; press feedback; chat bubbles with a typing indicator; and the story progress bar with a Ken Burns effect. `prefers-reduced-motion` turns these off and stops stories from auto-advancing.

## 4. Page structure (mobile)

1. **Header.** Wordmark and a Telegram pill. Its colors follow the section in view.
2. **Hero.** The line "Блогеры, которых не существует", a short subline, and a 4-slice portrait strip. Each slice opens that persona's stories, and the active slice rotates ambiently. Buttons: "Перейти в Telegram" plus a jump to the catalog.
3. **Catalog.** Four full-bleed sections, one per persona, each in its own backdrop color. Each contains:
   - topic and badge
   - the portrait (tap to open stories)
   - the huge name, handle, and bio
   - three honest stats (posts per week, a topic-specific stat, "24/7 в Telegram")
   - "Смотреть блог" plus a Telegram icon button
4. **How it works.** Three sequential steps.
5. **Final CTA.** Four avatar links to Telegram, a big "Перейти в Telegram" button, and a footer stating that all characters, images, and dialogues are AI-generated.
6. **Sticky bar.** "Написать Мире" plus an avatar. It follows the persona in view and hides over the hero, the final CTA, and open overlays.

**Desktop (≥1024px):** a split hero, the catalog as 4 rounded color panels in a row, and the stories viewer as a centered 9:16 frame with arrow buttons.

## 5. Interaction model

- **Stories.** Fullscreen, 5 per persona: 4 posts plus a closing CTA slide. Each post kind has its own surface: photo, paper checklist, ink data card, quote poster, photo with a poll sticker. The viewer chrome switches to dark text on light surfaces.
  - Segmented progress bar. Tap the right or left third to move; hold to pause; swipe down to close. Esc and the arrow keys also work.
  - After one persona's last slide, it moves to the next persona.
  - Poll posts can be voted on.
  - "Открыть профиль" swaps the story for that persona's profile.
- **Profile sheet** (vaul) with two tabs:
  - *Лента:* a 2×2 grid of posts; tapping one opens it in stories.
  - *Диалог:* a scripted chat with a typing indicator and 3 quick replies. After 2 replies, a Telegram handoff bubble appears. The bio collapses while the chat tab is open.
  - A sticky "Перейти в Telegram" footer.
- **Deep links and history.** `#mira` opens a profile and `#mira/stories` opens stories. The browser Back button closes the topmost overlay.
- **Telegram links:** `https://t.me/<NEXT_PUBLIC_TG_BOT>?start=<persona>_<utm_source>`. The value is sanitized to `[A-Za-z0-9_-]` and at most 64 characters.

## 6. Personas (neutral descriptors only)

| | Leo `@leo.builds` | Max `@max.outside` | Mira `@mira.archive` | Sophie `@sophie.slow` |
|---|---|---|---|---|
| Slot / topic | Male 1, business & tech | Male 2, sport & outdoors | Female 1, fashion | Female 2, lifestyle |
| Look | Wavy dark hair with grey streaks, tortoiseshell round glasses, short beard, dark knit sweater | Short black hair, wide open smile, burnt-orange hooded shell jacket over a black tee | Sleek black bob with bangs, silver hoop earrings, black oversized blazer | Long curly copper hair, freckles, cream cable-knit sweater |
| Backdrop | Cobalt | Moss | Lilac | Butter |
| Voice | Calm, dry, practical, «вы» | Energetic, «ты», 🏔 | Cool, ironic, opinionated | Warm, sensory, «ты» |

## 7. Image assets

**Provided and fixed:** one 1122×1402 studio portrait per persona, `public/personas/<id>/hero.png`. These are not regenerated, retouched, or replaced. Everything else derives from them in code:
- **Avatars:** face crops via `object-position` and scale.
- **Hero strip slices and story portraits:** crops of the same image.
- **Text posts** (lists, stats, quotes, polls): drawn in HTML on the persona's backdrop. In stories, the portrait fades in behind the text.
- **OG image:** `public/og.jpg`, a composite of the four portraits.

**Optional next step: 16 lifestyle post photos** (4 per persona, 9:16). They would be generated with each provided portrait as the identity reference. Two per persona would show the face; two would show no face (objects, landscapes, hands). The shot list uses neutral settings with no named places:
- **Leo:** night coworking with laptop glow · speaking at a small meetup · notebook flat lay · office window at dawn
- **Max:** ridge trail run at golden hour · camp morning with a steaming mug · POV running shoes over a valley · river canyon from above
- **Mira:** street-style shot in an old courtyard · flash beauty close-up · thrifted-pieces flat lay · hands on a vintage coat rack
- **Sophie:** kneading sourdough in a morning kitchen · reading in a window nook · breakfast overhead · market basket with flowers

## 8. Verification checklist

- Viewports 375×812, 390×844, 768×1024, 1440×900: no horizontal scroll, and the sticky bar never covers a CTA.
- Flows: strip → stories → profile → chat → Telegram. `?utm_source=x` is appended as `start=<persona>_x`.
- Keyboard: Tab, Enter, Esc, and the arrow keys. Reduced motion is respected.
- `npm run build` passes. Then deploy to Vercel and set `NEXT_PUBLIC_TG_BOT` and `NEXT_PUBLIC_SITE_URL`.
