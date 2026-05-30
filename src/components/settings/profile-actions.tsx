"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Camera, Pencil } from "lucide-react";

/**
 * Client profile actions for the settings page (Issue 7).
 *
 * Root cause fixed: the "Edit profile" CTA used to hard-link to
 * `/account/library` (wrong). Profile management — including avatar upload —
 * is Clerk's responsibility (ADR-8), so both the avatar and the button now
 * open Clerk's hosted `UserProfile` modal via `openUserProfile()`. That modal
 * is where the user changes their photo, name, email, and password.
 *
 * Rules-of-hooks safety mirrors `<CinematicHeader>`'s AccountSlot: when Clerk
 * isn't configured (local dev before `vercel env pull`) the components render
 * static fallbacks and never call Clerk hooks.
 */

const CLERK_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

// Dark cinematic theming for Clerk's hosted profile modal so it doesn't flash
// a light card over the emerald void.
const PROFILE_APPEARANCE = {
  variables: {
    colorPrimary: "#1ddf8f",
    colorBackground: "#0c1813",
    colorText: "#e6e6e0",
    colorTextSecondary: "#a7a7a0",
    colorInputBackground: "rgba(255, 255, 255, 0.03)",
    colorInputText: "#e6e6e0",
    borderRadius: "0.75rem",
  },
} as const;

const AVATAR_BOX =
  "relative flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24";
const AVATAR_SHADOW =
  "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(51,240,170,0.12), 0 12px 24px -8px rgba(0,0,0,0.6)";

export function ProfileAvatar({ initial }: { initial: string }) {
  if (!CLERK_CONFIGURED) return <AvatarFallback initial={initial} />;
  return <ClerkAvatar initial={initial} />;
}

function AvatarFallback({ initial }: { initial: string }) {
  return (
    <div
      className={`home-avatar-gradient font-serif text-[28px] font-medium text-[#032015] ${AVATAR_BOX}`}
      style={{ boxShadow: AVATAR_SHADOW }}
    >
      {initial}
    </div>
  );
}

function ClerkAvatar({ initial }: { initial: string }) {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const hasImage = isLoaded && user?.hasImage;

  return (
    <button
      type="button"
      onClick={() => openUserProfile({ appearance: PROFILE_APPEARANCE })}
      aria-label="Change profile photo"
      className={`group overflow-hidden ${AVATAR_BOX} ${
        hasImage ? "" : "home-avatar-gradient"
      }`}
      style={{ boxShadow: AVATAR_SHADOW }}
    >
      {hasImage ? (
        // Rendered as a CSS background (not <img>) so we avoid the
        // next/image remote-pattern allowlist for Clerk-hosted avatar URLs.
        <span
          role="img"
          aria-label="Your profile photo"
          className="h-full w-full rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url("${user!.imageUrl}")` }}
        />
      ) : (
        <span className="font-serif text-[28px] font-medium text-[#032015]">
          {initial}
        </span>
      )}

      {/* Hover overlay — "change photo" affordance */}
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Camera aria-hidden className="h-5 w-5 text-white" strokeWidth={1.8} />
      </span>
    </button>
  );
}

export function EditProfileButton() {
  if (!CLERK_CONFIGURED) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 text-sm font-medium tracking-tight text-fg-fade"
        title="Profile editing requires the auth provider to be configured"
      >
        <Pencil aria-hidden className="h-3.5 w-3.5" />
        Edit profile
      </span>
    );
  }
  return <ClerkEditButton />;
}

function ClerkEditButton() {
  const { openUserProfile } = useClerk();
  return (
    <button
      type="button"
      onClick={() => openUserProfile({ appearance: PROFILE_APPEARANCE })}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 text-sm font-medium tracking-tight text-fg-mid transition-all hover:-translate-y-0.5 hover:border-emerald-bright/40 hover:bg-emerald-bright/8 hover:text-fg-hi hover:shadow-[0_8px_18px_-6px_rgba(51,240,170,0.3)]"
    >
      <Pencil aria-hidden className="h-3.5 w-3.5" />
      Edit profile
    </button>
  );
}
