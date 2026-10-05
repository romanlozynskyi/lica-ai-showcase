# лица.ai — AI blogger showcase

A mobile-first landing page that presents four AI bloggers. Visitors can watch each blogger's stories, browse their feed, try a short scripted dialog, and then continue the conversation in Telegram.

**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, [vaul](https://github.com/emilkowalski/vaul) for the bottom sheet, and `next/font`. There is no backend. All content lives in [`data/personas.ts`](data/personas.ts).

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run typecheck
```

## Configuration

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_TG_BOT` | Telegram bot username used for every CTA | `lica_ai_demo_bot` (placeholder) |
| `NEXT_PUBLIC_SITE_URL` | Absolute URL for Open Graph tags | the Vercel production domain, else `http://localhost:3000` |

Copy [`.env.example`](.env.example) to `.env.local` to set them locally.

Every Telegram link has the form `https://t.me/<bot>?start=<persona>_<source>`. The source comes from `?utm_source=` (or `?src=`) on the landing URL, so each traffic channel and each chosen persona arrives at the bot already attributed.

## What's inside

- **Visual idea: "Seamless paper."** Each character is shot on a solid studio backdrop. Each persona's section uses the color sampled from their portrait, and the portrait edges are masked, so the person appears to stand inside the page. The header, the sticky Telegram bar, and the mobile browser's `theme-color` follow whichever character is on screen.
- **Hero.** A 4-slice portrait strip that rotates on its own. Tapping a slice opens that persona's stories.
- **Stories.** A fullscreen viewer.
  - Tap the left or right of a slide to move, hold to pause, and swipe down to close. The arrow keys and Esc also work.
  - Polls can be voted on.
  - Each persona has 5 stories: 4 posts plus a closing Telegram slide. After that, the next blogger starts.
- **Posts.** Five post designs are built from the portrait and palette, so a feed never looks like repeated placeholders:
  - a photo with a headline
  - a paper checklist carousel
  - a dark "in numbers" data card
  - a quote poster
  - a toned close-up with a poll sticker
- **Profile.** On phones it's a draggable bottom sheet; on desktop it's a two-pane card with the persona on the left and the content on the right. It has two tabs:
  - **Лента:** four different posts in a 2×2 grid, each opening into stories.
  - **Диалог:** a scripted chat that ends with a Telegram handoff.
- **Catalog alignment.** On desktop the four cards share a CSS subgrid, so bios, stat dividers and CTAs sit at the same height whatever the copy length.
- **Navigation.** The header nav underlines the section in view, and on mobile a "/ Мира" marker shows where you are.
- **Deep links.** `/#mira` opens Mira's profile and `/#mira/stories` opens her stories. The browser Back button closes the top overlay.
- **Motion.** Restrained and compositor-only (opacity and transform):
  - one shared, one-shot scroll observer drives subtle reveals with light staggering
  - story slides, profile tabs and the sticky bar label ease between states instead of cutting
  - everything is shown immediately under `prefers-reduced-motion` and without JavaScript
- **Accessibility.** Visible focus rings, a focus-trapped dialog, alt text on every portrait, 44px+ tap targets, safe-area insets, and full support for `prefers-reduced-motion`.

## AI-generated assets

The four studio portraits in `public/personas/<id>/hero.png` were generated with neural networks and are used unmodified as the fixed character identities. Everything else visual derives from them in code:
- avatars are face crops
- the hero strip and story frames are crops of the portraits
- text, data and poll posts are drawn in HTML from each persona's palette, with portrait crops where a photo is needed
- `public/og.jpg` is a composite of the four portraits

All characters, their posts, and their dialogs are fictional, and the page says so in its footer.

## Deploy

Import the repository on Vercel. The framework preset is detected automatically. Optionally set the two environment variables above.
