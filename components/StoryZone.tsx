"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Story slides are laid out in three protected bands:
 *   top     the viewer header (progress bars + author), measured at runtime
 *   content this zone
 *   bottom  the viewer caption + actions, measured at runtime
 * The viewer publishes the measured heights as --safe-top / --safe-bottom on the
 * frame, so slide content can never sit under either bar.
 *
 * If a slide's content is taller than the zone (short phones, long captions, big
 * system fonts) it is scaled down to fit instead of being clipped or hidden.
 */
export function StoryZone({
  children,
  align = "stretch",
  inset = "7cqw",
}: {
  children: React.ReactNode;
  /** "stretch": children lay themselves out top→bottom (use mt-auto inside). "center": content is centred. */
  align?: "stretch" | "center";
  inset?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;

    const fit = () => {
      // Natural height = layout height with the box sized by its content (no stretching),
      // so tight line-heights / glyph overshoot can't trigger a needless shrink.
      i.style.transform = "";
      i.style.width = "100%";
      i.style.height = "auto";
      const room = o.clientHeight;
      const need = i.offsetHeight;
      if (room > 0 && need > room + 1) {
        const s = room / need;
        i.style.width = `${100 / s}%`;
        i.style.height = `${100 / s}%`;
        i.style.transform = `scale(${s})`;
      } else {
        i.style.height = "100%";
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    // Late font swaps / image-less reflows change the natural height too
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div
      ref={outer}
      className="absolute"
      style={{ top: "var(--safe-top, 24cqw)", bottom: "var(--safe-bottom, 38cqw)", left: inset, right: inset }}
    >
      <div
        ref={inner}
        className={`flex flex-col ${align === "center" ? "items-center justify-center" : ""}`}
        style={{ transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}
