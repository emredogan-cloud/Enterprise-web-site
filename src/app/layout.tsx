import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

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

export const metadata: Metadata = {
  title: {
    default: "Digital Bookstore",
    template: "%s · Digital Bookstore",
  },
  description:
    "Buy a digital book once, download a watermarked PDF, and read it online. Yours to keep — never locked.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {/*
           * SiteHeader is a Server Component containing only a Server-Component
           * SearchBar (pure HTML form, no `"use client"`, no dynamic hooks).
           * Embedding it here does NOT downgrade any static / SSG route to
           * dynamic — verified in the SUB-PR 1.2 build output.
           */}
          <SiteHeader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
