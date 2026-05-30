import Link from "next/link";
import { Star } from "lucide-react";

import { RevealOnScroll } from "./reveal-on-scroll";

/**
 * "Featured Books — Handpicked for you" — 6 vertical book cards.
 *
 * Per design brief: tiny emerald eyebrow + serif heading + cards with
 * cover, title, author, rating, price; some cards carry floating absolute
 * badges (Bestseller / Popular).
 *
 * Each book cover is a CSS-rendered placeholder (gradient + serif title)
 * so the section ships with no image dependency.
 */
export function FeaturedBooksSection() {
  const books: BookProps[] = [
    {
      title: "Atomic Habits",
      author: "James Clear",
      price: "$19",
      rating: 4.9,
      coverGradient: "linear-gradient(160deg, #c9701a 0%, #5d2f08 100%)",
      coverAccent: "#ffce63",
      badge: { label: "Bestseller", color: "#ff9d4d" },
    },
    {
      title: "The Psychology of Money",
      author: "Morgan Housel",
      price: "$22",
      rating: 4.8,
      coverGradient: "linear-gradient(160deg, #1a2c1f 0%, #0a1610 100%)",
      coverAccent: "#33f0aa",
    },
    {
      title: "Anil Mary",
      author: "Anand Patel",
      price: "$15",
      rating: 4.7,
      coverGradient: "linear-gradient(160deg, #c84a4a 0%, #6b1818 100%)",
      coverAccent: "#ffd0d0",
      badge: { label: "Popular", color: "#7ab6ff" },
    },
    {
      title: "The Silent Patient",
      author: "Alex Michaelides",
      price: "$18",
      rating: 4.6,
      coverGradient: "linear-gradient(160deg, #16386b 0%, #051426 100%)",
      coverAccent: "#7ab6ff",
    },
    {
      title: "Fast Slow",
      author: "Daniel Kahneman",
      price: "$24",
      rating: 4.9,
      coverGradient: "linear-gradient(160deg, #d8d4cb 0%, #84807a 100%)",
      coverAccent: "#2a261f",
      darkText: true,
    },
    {
      title: "The Subtle Art of Not Giving a F*ck",
      author: "Mark Manson",
      price: "$17",
      rating: 4.5,
      coverGradient: "linear-gradient(160deg, #f4f2ed 0%, #d4d1ca 100%)",
      coverAccent: "#ff6b35",
      darkText: true,
    },
  ];

  return (
    <section className="relative px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll>
          <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#33f0aa]/80">
                Handpicked for you
              </p>
              <h2 className="mt-3 font-serif text-[36px] font-medium leading-tight tracking-tight text-[#e6e6e0] sm:text-[44px]">
                Featured books
              </h2>
            </div>
            <Link
              href="/books"
              className="text-sm font-medium text-[#33f0aa] underline-offset-4 hover:underline"
            >
              View all books →
            </Link>
          </header>
        </RevealOnScroll>

        <RevealOnScroll
          stagger
          className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6"
        >
          {books.map((book) => (
            <BookCard key={book.title} {...book} />
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}

interface BookProps {
  title: string;
  author: string;
  price: string;
  rating: number;
  coverGradient: string;
  coverAccent: string;
  darkText?: boolean;
  badge?: { label: string; color: string };
}

function BookCard(book: BookProps) {
  return (
    <Link
      href="/books"
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33f0aa]/60 rounded-lg"
    >
      {/* Cover */}
      <div className="home-card-hover relative aspect-[2/3] overflow-hidden rounded-md border border-white/[0.08] shadow-[0_24px_48px_-20px_rgba(0,0,0,0.7)]">
        <div
          className="absolute inset-0"
          style={{ background: book.coverGradient }}
        />

        {/* Top corner accent glow */}
        <div
          aria-hidden
          className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, ${book.coverAccent}40 0%, transparent 70%)`,
          }}
        />

        {/* Vertical text on cover */}
        <div className="absolute inset-0 flex flex-col justify-between p-3.5">
          <span
            className="text-[8px] font-medium uppercase tracking-[0.2em]"
            style={{
              color: book.darkText
                ? "rgba(0,0,0,0.5)"
                : "rgba(255,255,255,0.5)",
            }}
          >
            Featured
          </span>
          <p
            className="font-serif text-base font-medium leading-tight"
            style={{
              color: book.darkText ? "#1a1612" : "#fff",
            }}
          >
            {book.title}
          </p>
        </div>

        {/* Right edge highlight */}
        <div
          aria-hidden
          className="absolute right-0 top-[2px] bottom-[2px] w-[2px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.14) 100%)",
          }}
        />

        {/* Floating badge */}
        {book.badge && (
          <span
            className="absolute left-2 top-2 rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow-lg"
            style={{
              background: book.badge.color,
              backdropFilter: "blur(8px)",
            }}
          >
            {book.badge.label}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="mt-4 px-0.5">
        <h3 className="line-clamp-2 font-serif text-sm font-medium leading-snug text-[#e6e6e0] transition-colors group-hover:text-[#33f0aa]">
          {book.title}
        </h3>
        <p className="mt-1 text-xs text-[#88918a]">{book.author}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-[#a7a7a0]">
            <Star
              aria-hidden
              className="h-3 w-3 fill-[#33f0aa] text-[#33f0aa]"
            />
            {book.rating.toFixed(1)}
          </div>
          <span className="text-sm font-semibold text-[#e6e6e0]">
            {book.price}
          </span>
        </div>
      </div>
    </Link>
  );
}
