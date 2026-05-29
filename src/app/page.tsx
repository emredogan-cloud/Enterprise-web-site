import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's "%s · Digital Bookstore" template
  // — the home page is already the brand title; we don't want it doubled.
  title: {
    absolute: "Digital Bookstore — buy a book once, read it anywhere",
  },
  description:
    "A first-party bookstore for digital books. Buy a title once, download a watermarked PDF, and read it online. Yours to keep — never locked.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Digital Bookstore — buy a book once, read it anywhere",
    description:
      "Buy a digital book once, download a watermarked PDF, and read it online. Yours to keep — never locked.",
    url: "/",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="mx-auto w-full max-w-prose text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Digital Bookstore
        </p>
        <h1 className="mt-6 text-balance font-serif text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
          Find it. Own it. Read it anywhere.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          A first-party bookstore for digital books. Buy a title once, download a
          watermarked PDF, and read it online. Yours to keep — never locked.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/books">Browse the catalog</Link>
          </Button>
          <Button size="lg" variant="outline">
            About the project
          </Button>
        </div>
        <p className="mt-16 text-xs text-muted-foreground">
          SUB-PR 0.1 — scaffold, design tokens, and CI standard. Light and dark
          themes are fully tokenized.
        </p>
      </div>
    </main>
  );
}
