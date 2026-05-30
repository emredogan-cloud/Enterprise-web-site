import {
  Bell,
  CreditCard,
  Crown,
  Library,
  Lock,
  Receipt,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

/**
 * Persistent account sidebar for `/account/settings`.
 *
 * Reference structure: glass card with "ACCOUNT" eyebrow + 7 vertical
 * nav items + a Member status card at the bottom.
 *
 * Honest wiring (audit §3.1 — no dead links):
 *   - Library, Orders, Settings  → real routes
 *   - Profile                    → `#profile` anchor (jumps to the
 *                                  Profile & Identity card on the same
 *                                  page; the only "Profile" surface
 *                                  the storefront actually has)
 *   - Security / Notifications / Billing → marked with "Soon" pill and
 *                                  rendered as disabled buttons (not
 *                                  Links). Clicks are no-ops, screen
 *                                  readers announce them as disabled.
 *
 * Pure Server Component. Sticky on lg+; static block at top on mobile.
 */

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
} & (
  | { kind: "link"; href: string; active?: boolean }
  | { kind: "anchor"; href: string; active?: boolean }
  | { kind: "soon" }
);

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    key: "library",
    label: "Library",
    icon: Library,
    kind: "link",
    href: "/account/library",
  },
  {
    key: "orders",
    label: "Orders",
    icon: Receipt,
    kind: "link",
    href: "/account/orders",
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    kind: "link",
    href: "/account/settings",
    active: true,
  },
  {
    key: "profile",
    label: "Profile",
    icon: User,
    kind: "anchor",
    href: "#profile",
  },
  { key: "security", label: "Security", icon: Lock, kind: "soon" },
  { key: "notifications", label: "Notifications", icon: Bell, kind: "soon" },
  { key: "billing", label: "Billing", icon: CreditCard, kind: "soon" },
];

const DATE_FMT = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export function SettingsSidebar({
  memberSince,
}: {
  /** ISO date of the user's `users.created_at` — null when unavailable. */
  memberSince: Date | null;
}) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      {/* Nav card */}
      <nav
        aria-label="Account"
        className="home-glass relative overflow-hidden rounded-[28px] p-4"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
        />

        <p className="mb-3 px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-fg-soft">
          Account
        </p>

        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <SidebarItem item={item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Member status card */}
      <MemberCard memberSince={memberSince} />
    </aside>
  );
}

function SidebarItem({ item }: { item: NavItem }) {
  const Icon = item.icon;

  // Base inner: icon + label
  const inner = (
    <>
      <Icon
        aria-hidden
        className="h-4 w-4 flex-shrink-0"
      />
      <span className="flex-1">{item.label}</span>
    </>
  );

  if (item.kind === "soon") {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="flex w-full cursor-not-allowed items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm text-fg-fade"
      >
        {inner}
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-fg-soft">
          Soon
        </span>
      </button>
    );
  }

  const isActive = item.active === true;
  const className = `flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm transition-all ${
    isActive
      ? "bg-gradient-to-b from-[#0e3a28] to-[#0a2c1f] text-emerald-bright shadow-[inset_0_1px_0_rgba(51,240,170,0.15),0_0_14px_-2px_rgba(51,240,170,0.35)]"
      : "text-fg-mid hover:bg-white/[0.03] hover:text-fg-hi"
  }`;

  // `aria-current` only on the active LINK (not anchor jumps).
  const ariaCurrent =
    item.kind === "link" && isActive ? ("page" as const) : undefined;

  return (
    <Link href={item.href} className={className} aria-current={ariaCurrent}>
      {inner}
    </Link>
  );
}

/**
 * Member status card — bottom of the sidebar. Quiet luxury, not marketing.
 */
function MemberCard({ memberSince }: { memberSince: Date | null }) {
  return (
    <div className="home-glass relative overflow-hidden rounded-[28px] p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
      />

      {/* Bloom backdrop — emerald aura around the crown */}
      <div
        aria-hidden
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(51,240,170,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative">
        <Crown
          aria-hidden
          className="h-5 w-5 text-emerald-bright"
          strokeWidth={1.6}
        />
        <p className="mt-3 font-serif text-[18px] font-medium leading-tight text-fg-hi">
          You&apos;re a Member
        </p>
        {memberSince && (
          <p className="mt-1.5 text-xs text-fg-soft">
            Member since {DATE_FMT.format(memberSince)}
          </p>
        )}
      </div>
    </div>
  );
}
