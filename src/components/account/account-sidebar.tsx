import {
  Bell,
  CreditCard,
  Heart,
  LayoutDashboard,
  Library,
  MapPin,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { SupportCard } from "@/components/order/support-card";

/**
 * AccountSidebar — the persistent cinematic account navigation.
 *
 * Parameterized by `active` so any account surface can mount it (orders now;
 * settings can adopt it later). Glass nav card + a reused `<SupportCard>`
 * beneath it.
 *
 * Honest wiring (no dead links, matching the established SettingsSidebar
 * convention): Library / Orders / Settings are the three real routes; the
 * aspirational items (Dashboard, Wishlist, Addresses, Payment Methods,
 * Notifications) render as disabled "Soon" buttons — visible in the
 * architecture, but never a broken click.
 *
 * Pure Server Component. Sticky on lg+, a stacked block on mobile.
 */

export type AccountNavKey =
  | "dashboard"
  | "library"
  | "orders"
  | "settings"
  | "wishlist"
  | "addresses"
  | "payment"
  | "notifications";

type NavItem = { key: AccountNavKey; label: string; icon: LucideIcon } & (
  | { kind: "link"; href: string }
  | { kind: "soon" }
);

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, kind: "soon" },
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
  },
  { key: "wishlist", label: "Wishlist", icon: Heart, kind: "soon" },
  { key: "addresses", label: "Addresses", icon: MapPin, kind: "soon" },
  { key: "payment", label: "Payment Methods", icon: CreditCard, kind: "soon" },
  { key: "notifications", label: "Notifications", icon: Bell, kind: "soon" },
];

export function AccountSidebar({ active }: { active: AccountNavKey }) {
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
              <SidebarItem item={item} active={item.key === active} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Reused support card — the same "Need help?" surface the order
          confirmation uses, so the contact path is consistent everywhere. */}
      <SupportCard />
    </aside>
  );
}

function SidebarItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  const inner = (
    <>
      <Icon aria-hidden className="h-4 w-4 flex-shrink-0" />
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

  const className = `group flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm transition-all duration-300 ${
    active
      ? "bg-gradient-to-b from-[#0e3a28] to-[#0a2c1f] text-emerald-bright shadow-[inset_0_1px_0_rgba(51,240,170,0.15),0_0_14px_-2px_rgba(51,240,170,0.35)]"
      : "text-fg-mid hover:translate-x-0.5 hover:bg-white/[0.03] hover:text-fg-hi"
  }`;

  return (
    <Link
      href={item.href}
      className={className}
      aria-current={active ? "page" : undefined}
    >
      {inner}
      {active && (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-emerald-bright shadow-[0_0_8px_#33f0aa]"
        />
      )}
    </Link>
  );
}
