import { Pencil } from "lucide-react";

/**
 * Profile & Identity card — horizontal glass panel in the settings
 * page main column.
 *
 * Layout:
 *   ┌────────────────────────────────────────────────────┐
 *   │ AVATAR    Name              [Edit profile]        │
 *   │           email@example.com  ┌──────────────────┐ │
 *   │           Member since …     │ Premium Member   │ │
 *   │                              └──────────────────┘ │
 *   └────────────────────────────────────────────────────┘
 *
 * Carries `id="profile"` so the sidebar's anchor link jumps cleanly to
 * this card. `scroll-margin-top` is set so the cinematic header doesn't
 * clip the top of the card after the jump.
 *
 * "Edit profile" CTA points at Clerk's hosted account portal (managed
 * profile is Clerk's responsibility, per ADR-8). Falls back to "#" with
 * a `disabled`-style affordance when Clerk isn't configured.
 *
 * Pure Server Component.
 */

const DATE_FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export function ProfileIdentityCard({
  email,
  name,
  memberSince,
}: {
  email: string;
  name: string | null;
  memberSince: Date | null;
}) {
  const initial = (name?.charAt(0) || email.charAt(0) || "?").toUpperCase();
  const clerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );

  return (
    <article
      id="profile"
      className="home-glass relative scroll-mt-24 overflow-hidden rounded-[28px] p-6 sm:p-8"
    >
      {/* Top emerald edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
      />

      {/* Section header */}
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
          Profile &amp; Identity
        </p>
      </header>

      {/* Body — avatar + identity + edit row */}
      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-7">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {/* Bloom backdrop */}
          <div
            aria-hidden
            className="absolute inset-0 -m-3 rounded-full opacity-50"
            style={{
              background:
                "radial-gradient(circle, rgba(51, 240, 170, 0.4) 0%, transparent 70%)",
            }}
          />
          <div
            className="home-avatar-gradient relative flex h-20 w-20 items-center justify-center rounded-full font-serif text-[28px] font-medium text-[#032015] sm:h-24 sm:w-24"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(51,240,170,0.12), 0 12px 24px -8px rgba(0,0,0,0.6)",
            }}
          >
            {initial}
          </div>
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[22px] font-medium leading-tight text-fg-hi sm:text-[24px]">
            {name ?? "Reader"}
          </p>
          <p className="mt-2 break-all font-mono text-xs text-fg-mid sm:text-[13px]">
            {email}
          </p>
          {memberSince && (
            <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-fg-soft">
              Member since {DATE_FMT.format(memberSince)}
            </p>
          )}
        </div>

        {/* Right cluster — Edit + Premium pill */}
        <div className="flex flex-col items-start gap-3 sm:items-end">
          {clerkConfigured ? (
            <a
              href="/account/library"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 text-sm font-medium tracking-tight text-fg-mid transition-all hover:-translate-y-0.5 hover:border-emerald-bright/40 hover:bg-emerald-bright/8 hover:text-fg-hi hover:shadow-[0_8px_18px_-6px_rgba(51,240,170,0.3)]"
            >
              <Pencil aria-hidden className="h-3.5 w-3.5" />
              Edit profile
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 text-sm font-medium tracking-tight text-fg-fade"
              title="Profile editing requires the auth provider to be configured"
            >
              <Pencil aria-hidden className="h-3.5 w-3.5" />
              Edit profile
            </span>
          )}

          {/* Premium Member pill */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-bright/30 bg-emerald-bright/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-bright">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-emerald-bright shadow-[0_0_6px_#33f0aa]"
            />
            Premium Member
          </span>
        </div>
      </div>
    </article>
  );
}
