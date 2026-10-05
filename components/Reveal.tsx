"use client";

import { createElement, useEffect, useRef } from "react";

/**
 * Scroll reveal. One shared IntersectionObserver for the whole page; each element is
 * observed until it first enters the viewport, then released (no per-frame work, no
 * state, no re-render). The visual effect is pure CSS (.reveal in globals.css):
 * opacity + a short translate, so it stays on the compositor.
 */
let observer: IntersectionObserver | null = null;

function shared() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
  );
  return observer;
}

type Tag = "div" | "li" | "p" | "h2" | "footer";

export function Reveal({
  as = "div",
  index = 0,
  stagger = "always",
  className = "",
  children,
}: {
  as?: Tag;
  /** Position in a group; becomes a light delay (see .reveal in globals.css) */
  index?: number;
  /** "desktop": only stagger when items sit side by side (>=1024px); stacked items reveal as you reach them */
  stagger?: "always" | "desktop";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = shared();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return createElement(
    as,
    {
      ref,
      className: `reveal ${stagger === "desktop" ? "reveal-d" : ""} ${className}`,
      style: { "--i": index } as React.CSSProperties,
    },
    children,
  );
}
