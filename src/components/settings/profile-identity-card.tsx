import { EditProfileButton, ProfileAvatar } from "./profile-actions";

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
 * Issue 7 fix: the avatar + "Edit profile" CTA now open Clerk's hosted
 * `UserProfile` modal (avatar upload + name/email management) via the
 * `<ProfileAvatar>` / `<EditProfileButton>` client islands — previously the
 * button hard-linked to `/account/library`, which was simply wrong.
 *
 * Pure Server Component (the two action islands hydrate on their own).
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
        {/* Avatar — click to change photo (opens Clerk's profile modal) */}
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
          <ProfileAvatar initial={initial} />
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
          <EditProfileButton />

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
