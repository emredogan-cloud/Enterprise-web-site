import { CinematicHeader } from "@/components/home/cinematic-header";
import { HomeFooter } from "@/components/home/home-footer";

/**
 * Unprovisioned notice — a calm, on-brand stand-in shown when a dynamic
 * route cannot run because required runtime configuration is missing
 * (Clerk keys, DATABASE_URL, R2 credentials, …).
 *
 * This replaces what would otherwise be a hard 500 with a useful page that
 * tells the operator exactly which env vars to set.
 *
 * Phase 0.G — rewritten in the cinematic dark theme. Previously this
 * was a warm-token panel rendered inside the auth-gated cinematic shell
 * (`/account/library`, `/order/[id]`, `/admin`, etc.), which produced a
 * jarring warm-light card sitting in an otherwise dark surface whenever
 * the env was missing. The shell now wraps itself in `.cinematic-root`
 * with the shared header/footer so the unprovisioned state IS the
 * cinematic shell.
 *
 * Server Component, no client JS, no dynamic hooks — safe to render
 * from any route segment.
 */
export interface UnprovisionedNoticeProps {
  title: string;
  body: string;
  missing?: ReadonlyArray<string>;
}

export function UnprovisionedNotice({
  title,
  body,
  missing = [],
}: UnprovisionedNoticeProps) {
  return (
    <div className="cinematic-root">
      <CinematicHeader />

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-24 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
            Configuration required
          </p>

          {/* Diamond ornament */}
          <div className="relative mt-4 flex h-6 w-6 items-center justify-center">
            <div
              aria-hidden
              className="absolute h-6 w-6 rounded-full opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(51, 240, 170, 0.7) 0%, transparent 70%)",
              }}
            />
            <span
              aria-hidden
              className="catalog-diamond block h-2 w-2 rounded-[1px] bg-[#33f0aa]"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>

          {/* Title */}
          <h1 className="mt-6 font-serif text-[36px] font-medium leading-[1.1] tracking-[-0.025em] text-fg-hi sm:text-[44px]">
            {title}
          </h1>

          {/* Body */}
          <p className="mt-5 max-w-lg text-base leading-relaxed text-fg-mid sm:text-[17px]">
            {body}
          </p>
        </div>

        {/* Missing-vars panel — cinematic glass */}
        {missing.length > 0 && (
          <div className="home-glass mx-auto mt-12 max-w-md overflow-hidden rounded-[24px] p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#33f0aa]/35 to-transparent"
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
              Set these environment variables
            </p>
            <ul className="mt-4 space-y-1.5 font-mono text-sm text-fg-hi">
              {missing.map((name) => (
                <li key={name} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1 w-1 rounded-full bg-[#33f0aa] shadow-[0_0_4px_#33f0aa]"
                  />
                  {name}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-fg-soft">
              See{" "}
              <code className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-emerald-bright">
                .env.example
              </code>{" "}
              for the full schema. Pull them from Vercel with{" "}
              <code className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-emerald-bright">
                vercel env pull .env.local
              </code>
              .
            </p>
          </div>
        )}

        <div className="h-16" />
      </main>

      <HomeFooter />
    </div>
  );
}
