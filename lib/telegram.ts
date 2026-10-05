const BOT = process.env.NEXT_PUBLIC_TG_BOT || "lica_ai_demo_bot";

/** Telegram allows [A-Za-z0-9_-] and up to 64 chars in the start parameter. */
const clean = (v: string) => v.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 24);

export function telegramLink(personaId?: string, source?: string) {
  const parts = [personaId ? clean(personaId) : "all", source ? clean(source) : ""].filter(Boolean);
  return `https://t.me/${BOT}?start=${parts.join("_").slice(0, 64)}`;
}

export function readSource(search: string) {
  const params = new URLSearchParams(search);
  return clean(params.get("utm_source") || params.get("src") || "");
}
