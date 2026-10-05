"use client";

import { Chrome } from "@/components/Chrome";
import { Hero } from "@/components/Hero";
import { PersonaCard } from "@/components/PersonaCard";
import { ProfileSheet } from "@/components/ProfileSheet";
import { FinalCta, HowItWorks } from "@/components/Sections";
import { ShowcaseProvider } from "@/components/showcase-context";
import { StoryViewer } from "@/components/StoryViewer";
import { personas } from "@/data/personas";

export default function Page() {
  return (
    <ShowcaseProvider>
      <Chrome />
      <main>
        <Hero />
        <section id="catalog" aria-label="Каталог блогеров" className="scroll-mt-14 lg:bg-studio lg:px-8 lg:pt-6">
          <div className="mx-auto max-w-[1400px] lg:grid lg:grid-cols-4 lg:gap-x-4 lg:gap-y-0">
            {personas.map((p, i) => (
              <PersonaCard key={p.id} persona={p} priority={i === 0} />
            ))}
          </div>
        </section>
        <HowItWorks />
        <FinalCta />
      </main>
      <ProfileSheet />
      <StoryViewer />
    </ShowcaseProvider>
  );
}
