import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Serif display face for headings — typography-forward, calm-literary (Roadmap §7)
const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

// `metadataBase` absolutizes every relative URL emitted by per-page
// `generateMetadata` (canonicals, OG images, Twitter images, …). Reads
// `NEXT_PUBLIC_APP_URL` (declared in `.env.example`); falls back to
// localhost so dev / unprovisioned-env builds never crash on metadata.
// NOTE: `||` (not `??`) is deliberate — an empty-string env value ("")
// must also fall back; `new URL("")` throws and would 500 every page.
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Digital Bookstore",
    template: "%s · Digital Bookstore",
  },
  description:
    "Buy a digital book once, download a watermarked PDF, and read it online. Yours to keep — never locked.",
  // Per-page metadata extends these defaults via the App Router merge.
  openGraph: {
    siteName: "Digital Bookstore",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*
   * ROOT-LAYOUT RESILIENCE — why this conditional exists.
   *
   * `<ClerkProvider>` throws a HARD error during render when
   * `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing. Because it sits in the
   * root layout, that throw propagates as a 500 on **every** route —
   * including the public static pages like `/` that don't even need Clerk.
   *
   * On a freshly-deployed Vercel environment where the env hasn't been
   * pulled yet, that's a fully-broken site. The fix: only mount the
   * provider when the publishable key is actually present. When it isn't,
   * public pages render normally with their graceful empty states, and
   * auth-gated routes (`/admin`, future `/account`, `/read`) still surface
   * the `UnprovisionedNotice` they already render at the page level.
   *
   * In production with a real deploy, the key is set; this branch is a
   * no-op and `<ClerkProvider>` mounts exactly as before.
   *
   * `NEXT_PUBLIC_*` vars are inlined at build time on the client and
   * available via `process.env` on the server, so the conditional resolves
   * to the same value on both sides — no hydration mismatch.
   */
  const tree = (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        {/*
          Vercel Analytics + Speed Insights (SUB-PR 4.3).
          Both components lazy-mount their respective beacons; outside a
          Vercel deployment (local dev, self-host) they NO-OP — no network,
          no console noise. Placed inside <body> AFTER {children} so they
          render in BOTH the with-Clerk and without-Clerk root-layout
          branches (conditional ClerkProvider below).
        */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return tree;

  return (
    <ClerkProvider publishableKey={publishableKey}>{tree}</ClerkProvider>
  );
}
