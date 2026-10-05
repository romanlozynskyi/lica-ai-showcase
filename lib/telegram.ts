/**
 * Demo destination: Telegram's official channel. It is a real, public page, so every
 * "Перейти в Telegram" button works out of the box. Set NEXT_PUBLIC_TG_BOT to your own
 * bot (username without @) to send visitors to it instead.
 */
const DEMO_DESTINATION = "telegram";

const configured = process.env.NEXT_PUBLIC_TG_BOT?.trim().replace(/^@/, "");
// Telegram usernames: 5-32 chars, letters, digits and underscores
const DESTINATION = configured && /^[A-Za-z0-9_]{5,32}$/.test(configured) ? configured : DEMO_DESTINATION;

/** Telegram allows [A-Za-z0-9_-] and up to 64 chars in the start parameter. */
const clean = (v: string) => v.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 24);

/** Link to the destination; the persona and traffic source ride along in the `start` parameter (used by bots). */
export function telegramLink(personaId?: string, source?: string) {
  const parts = [personaId ? clean(personaId) : "all", source ? clean(source) : ""].filter(Boolean);
  return `https://t.me/${DESTINATION}?start=${parts.join("_").slice(0, 64)}`;
}

export function readSource(search: string) {
  const params = new URLSearchParams(search);
  return clean(params.get("utm_source") || params.get("src") || "");
}
