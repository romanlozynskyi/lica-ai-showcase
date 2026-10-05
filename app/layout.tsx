import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Onest, Sofia_Sans_Extra_Condensed } from "next/font/google";
import "./globals.css";

const sofia = Sofia_Sans_Extra_Condensed({
  subsets: ["latin", "cyrillic"],
  weight: ["800", "900"],
  variable: "--font-sofia",
  display: "swap",
});

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-onest",
  display: "swap",
});

const jet = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["500"],
  variable: "--font-jet",
  display: "swap",
});

// Absolute base for Open Graph URLs: explicit setting, else the Vercel production domain, else local dev
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "лица.ai — ИИ-блогеры, которые отвечают в Telegram",
  description:
    "Четыре ИИ-блогера со своим характером, лентой и голосом. Смотрите истории, листайте ленту и пишите им в Telegram.",
  openGraph: {
    title: "лица.ai — ИИ-блогеры, которые отвечают в Telegram",
    description: "Блогеры, которых не существует. Но они ответят вам в Telegram.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#e8e9eb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${sofia.variable} ${onest.variable} ${jet.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
