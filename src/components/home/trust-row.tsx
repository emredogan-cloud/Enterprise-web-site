import { Download, FileCheck, Infinity as InfinityIcon, ShieldCheck } from "lucide-react";

/**
 * Four trust micro-features beneath the hero CTAs.
 * Subtle, no chrome — just icon + label aligned in a row.
 */
export function TrustRow() {
  const items = [
    { icon: FileCheck, label: "Watermark-free PDF" },
    { icon: Download, label: "Instant Download" },
    { icon: InfinityIcon, label: "Yours to Keep" },
    { icon: ShieldCheck, label: "Secure Payments" },
  ];

  return (
    <ul className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.label}
            className="group flex items-center gap-2 text-sm text-fg-mid transition-colors hover:text-fg-hi"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] transition-all group-hover:border-emerald-deep/40 group-hover:bg-emerald-deep/10">
              <Icon
                aria-hidden
                className="h-3.5 w-3.5 text-emerald-bright transition-transform group-hover:scale-110"
              />
            </span>
            {item.label}
          </li>
        );
      })}
    </ul>
  );
}
