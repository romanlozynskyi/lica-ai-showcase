import Image from "next/image";
import type { Persona } from "@/data/personas";

/** Face crop of the hero portrait — no separate avatar asset needed */
export function Avatar({
  persona,
  className = "size-10",
  zoom = 1.9,
  style,
}: {
  persona: Persona;
  className?: string;
  zoom?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ backgroundColor: persona.theme.backdrop, ...style }}
    >
      <Image
        src={persona.hero.src}
        alt=""
        fill
        sizes="96px"
        className="object-cover"
        style={{ objectPosition: persona.hero.focal, transform: `scale(${zoom})`, transformOrigin: persona.hero.focal }}
      />
    </span>
  );
}
