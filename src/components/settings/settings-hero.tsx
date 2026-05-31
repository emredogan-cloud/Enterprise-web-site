import { AssetImage } from "@/components/cinematic/asset-image";

import { DeskScene } from "./desk-scene";

/**
 * Settings hero — the editorial top strip of `/account/settings`.
 *
 * Asymmetric two-column composition (left = editorial copy, right =
 * atmospheric scene). Doesn't reuse `<CinematicHero>` because the scene
 * panel is **bleed-aligned to the right viewport edge** in the reference
 * (no rounded frame, no fixed aspect ratio) — that's a hero shape the
 * shared component doesn't expose.
 *
 * Pure Server Component.
 */
export function SettingsHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Two-column grid — text + atmospheric scene */}
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_42%)] lg:gap-16">
        {/* LEFT — editorial text */}
        <div className="relative z-10 pt-2 sm:pt-6">
          {/* Eyebrow */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-bright">
            Account
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
              className="catalog-diamond block h-2 w-2 rounded-[1px] bg-emerald-bright"
              style={{ transform: "rotate(45deg)" }}
            />
          </div>

          {/* Headline — xl scale (biggest on the cinematic site, alongside the
              homepage hero) to match the reference's "this is YOUR space" weight */}
          <h1 className="mt-6 font-serif text-[52px] font-medium leading-[1.02] tracking-[-0.025em] text-fg-hi sm:text-[64px] lg:text-[80px]">
            Settings
          </h1>

          {/* Supporting copy */}
          <p className="mt-5 max-w-md text-base leading-relaxed text-fg-mid sm:text-[17px]">
            Manage your account, privacy, and data with complete control.
          </p>
        </div>

        {/* RIGHT — atmospheric scene. Bleeds toward the right viewport edge;
            on mobile (stacked) it sits as a 5/4 aspect strip above the text. */}
        <div className="relative -mr-4 aspect-[5/3] w-full overflow-hidden rounded-l-[32px] border border-white/[0.06] sm:-mr-6 lg:mr-0 lg:aspect-[4/3] lg:rounded-[24px]">
          {/* Top emerald edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
          />
          <AssetImage
            src="/images/settings/settings_desk_scene.webp"
            alt=""
            fallback={<DeskScene />}
            sizes="(min-width: 1024px) 44vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
