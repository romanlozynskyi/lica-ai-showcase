"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { isPersonaId, type PersonaId } from "@/data/personas";
import { readSource, telegramLink } from "@/lib/telegram";

export type Overlays = {
  profile: PersonaId | null;
  story: { persona: PersonaId; index: number } | null;
};

type Ctx = Overlays & {
  source: string;
  tgLink: (persona?: PersonaId) => string;
  /** replace=true swaps the current history entry (e.g. story → profile) */
  openProfile: (id: PersonaId, replace?: boolean) => void;
  openStories: (id: PersonaId, index?: number) => void;
  /** Move to another slide/persona without adding history entries */
  setStory: (story: Overlays["story"]) => void;
  closeTop: () => void;
};

const ShowcaseContext = createContext<Ctx | null>(null);

const EMPTY: Overlays = { profile: null, story: null };

function hashFor(o: Overlays) {
  if (o.story) return `#${o.story.persona}/stories`;
  if (o.profile) return `#${o.profile}`;
  return "";
}

function fromHash(hash: string): Overlays {
  const [id, sub] = hash.replace(/^#/, "").split("/");
  if (!id || !isPersonaId(id)) return EMPTY;
  return sub === "stories" ? { profile: null, story: { persona: id, index: 0 } } : { profile: id, story: null };
}

export function ShowcaseProvider({ children }: { children: React.ReactNode }) {
  const [overlays, setOverlays] = useState<Overlays>(EMPTY);
  const [source, setSource] = useState("");
  const depth = useRef(0);
  const current = useRef<Overlays>(EMPTY);

  const write = (o: Overlays, mode: "push" | "replace") => {
    const url = `${location.pathname}${location.search}${hashFor(o)}`;
    if (mode === "push") {
      history.pushState(o, "", url);
      depth.current += 1;
    } else {
      history.replaceState(o, "", url);
    }
  };

  useEffect(() => {
    setSource(readSource(location.search));
    const initial = fromHash(location.hash);
    if (initial.profile || initial.story) {
      current.current = initial;
      setOverlays(initial);
      history.replaceState(initial, "", location.href);
    }
    const onPop = (e: PopStateEvent) => {
      depth.current = Math.max(0, depth.current - 1);
      const next = (e.state as Overlays | null) ?? fromHash(location.hash);
      current.current = next;
      setOverlays(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const apply = useCallback((next: Overlays, mode: "push" | "replace") => {
    write(next, mode);
    current.current = next;
    setOverlays(next);
  }, []);

  const openProfile = useCallback(
    (id: PersonaId, replace = false) => apply({ profile: id, story: null }, replace ? "replace" : "push"),
    [apply],
  );

  const openStories = useCallback(
    (id: PersonaId, index = 0) => apply({ profile: current.current.profile, story: { persona: id, index } }, "push"),
    [apply],
  );

  const setStory = useCallback(
    (story: Overlays["story"]) => apply({ ...current.current, story }, "replace"),
    [apply],
  );

  const closeTop = useCallback(() => {
    if (depth.current > 0) {
      history.back();
      return;
    }
    const prev = current.current;
    apply(prev.story ? { ...prev, story: null } : EMPTY, "replace");
  }, [apply]);

  const tgLink = useCallback((persona?: PersonaId) => telegramLink(persona, source), [source]);

  const value = useMemo(
    () => ({ ...overlays, source, tgLink, openProfile, openStories, setStory, closeTop }),
    [overlays, source, tgLink, openProfile, openStories, setStory, closeTop],
  );

  return <ShowcaseContext.Provider value={value}>{children}</ShowcaseContext.Provider>;
}

export function useShowcase() {
  const ctx = useContext(ShowcaseContext);
  if (!ctx) throw new Error("useShowcase must be used inside ShowcaseProvider");
  return ctx;
}
