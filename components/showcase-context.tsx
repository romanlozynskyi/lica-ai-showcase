"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { isPersonaId, personaById, type PersonaId } from "@/data/personas";
import { readSource, telegramLink } from "@/lib/telegram";

export type Overlays = {
  profile: PersonaId | null;
  story: { persona: PersonaId; index: number } | null;
};

type FocusKind = "profile" | "story";

type Ctx = Overlays & {
  source: string;
  tgLink: (persona?: PersonaId) => string;
  /** replace=true swaps the current history entry (e.g. story → profile) */
  openProfile: (id: PersonaId, replace?: boolean) => void;
  openStories: (id: PersonaId, index?: number) => void;
  /** Move to another slide/persona without adding history entries */
  setStory: (story: Overlays["story"]) => void;
  closeTop: () => void;
  /** Give keyboard focus back to the control that opened the overlay (if it is still on the page) */
  restoreFocus: (kind: FocusKind, personaId?: PersonaId) => void;
};

const ShowcaseContext = createContext<Ctx | null>(null);

const EMPTY: Overlays = { profile: null, story: null };

/* ------------------------------------------------------------------ *
 * Overlay state <-> URL hash <-> history.state
 *
 * Everything that can enter the app from outside (a typed hash, a stale
 * or foreign history.state) is validated here, so a bad value degrades to
 * "no overlay" instead of crashing a render.
 * ------------------------------------------------------------------ */

/** Namespace inside history.state (Next.js keeps its own keys there too) */
const KEY = "lica";

type Stored = Overlays & { own?: boolean };

const stored = (): Stored | undefined => (history.state as Record<string, Stored> | null)?.[KEY];

/** True when the current history entry was pushed by opening an overlay, i.e. "Back" closes it */
const ownsEntry = () => !!stored()?.own;

function parseStored(v: unknown): Overlays | null {
  if (!v || typeof v !== "object") return null;
  const { profile = null, story = null } = v as Record<string, unknown>;
  if (profile !== null && !isPersonaId(profile)) return null;

  let parsedStory: Overlays["story"] = null;
  if (story !== null) {
    if (!story || typeof story !== "object") return null;
    const { persona, index } = story as Record<string, unknown>;
    // +1: the closing "continue in Telegram" slide
    if (!isPersonaId(persona) || typeof index !== "number" || !Number.isInteger(index)) return null;
    if (index < 0 || index > personaById[persona].posts.length) return null;
    parsedStory = { persona, index };
  }
  return { profile, story: parsedStory };
}

function fromHash(hash: string): Overlays {
  let raw = hash.replace(/^#/, "");
  try {
    raw = decodeURIComponent(raw);
  } catch {
    return EMPTY;
  }
  const [id, sub, ...extra] = raw.split("/");
  if (extra.length > 0 || !isPersonaId(id)) return EMPTY;
  if (sub === undefined || sub === "") return { profile: id, story: null };
  if (sub === "stories") return { profile: null, story: { persona: id, index: 0 } };
  return EMPTY;
}

const readOverlays = (state: unknown, hash: string): Overlays =>
  parseStored((state as Record<string, unknown> | null)?.[KEY]) ?? fromHash(hash);

const hashFor = (o: Overlays) => (o.story ? `#${o.story.persona}/stories` : o.profile ? `#${o.profile}` : "");

function write(o: Overlays, mode: "push" | "replace") {
  const url = `${location.pathname}${location.search}${hashFor(o)}`;
  if (mode === "push") history.pushState({ [KEY]: { ...o, own: true } }, "", url);
  else history.replaceState({ [KEY]: { ...o, own: ownsEntry() } }, "", url);
}

export function ShowcaseProvider({ children }: { children: React.ReactNode }) {
  const [overlays, setOverlays] = useState<Overlays>(EMPTY);
  const [source, setSource] = useState("");
  const current = useRef<Overlays>(EMPTY);

  // Who opened what, so closing can return keyboard focus there
  const openers = useRef<Record<FocusKind, HTMLElement | null>>({ profile: null, story: null });
  const lastPressed = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setSource(readSource(location.search));

    const initial = readOverlays(history.state, location.hash);
    if (initial.profile || initial.story) {
      current.current = initial;
      setOverlays(initial);
      // Landed on a deep link: this entry is the page itself, so Close replaces rather than goes back
      if (!stored()) history.replaceState({ [KEY]: { ...initial, own: false } }, "", location.href);
    }

    // popstate (Back/Forward) and hashchange (typed hash, in-page links) both re-derive the overlays
    const sync = () => {
      const next = readOverlays(history.state, location.hash);
      current.current = next;
      setOverlays(next);
    };
    // Safari doesn't focus buttons on click, so remember the last pressed control as a fallback opener
    const onPress = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("button, a[href]");
      lastPressed.current = el instanceof HTMLElement ? el : null;
    };

    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    document.addEventListener("pointerdown", onPress, true);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
      document.removeEventListener("pointerdown", onPress, true);
    };
  }, []);

  const grabOpener = () => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) return active;
    return lastPressed.current?.isConnected ? lastPressed.current : null;
  };

  const apply = useCallback((next: Overlays, mode: "push" | "replace") => {
    write(next, mode);
    current.current = next;
    setOverlays(next);
  }, []);

  const openProfile = useCallback(
    (id: PersonaId, replace = false) => {
      if (replace) {
        // story → profile: the profile inherits the story's opener; the story must not steal focus back
        openers.current.profile = openers.current.story ?? openers.current.profile;
        openers.current.story = null;
      } else {
        openers.current.profile = grabOpener();
      }
      apply({ profile: id, story: null }, replace ? "replace" : "push");
    },
    [apply],
  );

  const openStories = useCallback(
    (id: PersonaId, index = 0) => {
      openers.current.story = grabOpener();
      apply({ profile: current.current.profile, story: { persona: id, index } }, "push");
    },
    [apply],
  );

  const setStory = useCallback(
    (story: Overlays["story"]) => apply({ ...current.current, story }, "replace"),
    [apply],
  );

  const closeTop = useCallback(() => {
    // We pushed this entry when the overlay opened, so Back is the exact inverse. The popstate
    // handler then restores whatever was underneath (nothing, or the profile below a story).
    if (ownsEntry()) {
      history.back();
      return;
    }
    // Deep link / reload: there is nothing to go back to, so close in place
    const cur = current.current;
    apply(cur.story && cur.profile ? { profile: cur.profile, story: null } : EMPTY, "replace");
  }, [apply]);

  const restoreFocus = useCallback((kind: FocusKind, personaId?: PersonaId) => {
    let el = openers.current[kind];
    openers.current[kind] = null;
    if (!el?.isConnected && personaId) {
      // Opened from a deep link: fall back to the persona's card button
      el = document.querySelector<HTMLElement>(`#card-${personaId} button.btn-cta`);
    }
    if (el?.isConnected) el.focus({ preventScroll: true });
  }, []);

  const tgLink = useCallback((persona?: PersonaId) => telegramLink(persona, source), [source]);

  const value = useMemo(
    () => ({ ...overlays, source, tgLink, openProfile, openStories, setStory, closeTop, restoreFocus }),
    [overlays, source, tgLink, openProfile, openStories, setStory, closeTop, restoreFocus],
  );

  return <ShowcaseContext.Provider value={value}>{children}</ShowcaseContext.Provider>;
}

export function useShowcase() {
  const ctx = useContext(ShowcaseContext);
  if (!ctx) throw new Error("useShowcase must be used inside ShowcaseProvider");
  return ctx;
}
