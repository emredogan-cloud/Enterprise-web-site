import { Button } from "@/components/ui/button";

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
          <Button size="lg">Browse the catalog</Button>
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
