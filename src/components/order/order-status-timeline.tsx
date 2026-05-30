import { Check, FileCheck, Inbox, Sparkles } from "lucide-react";

import type { OrderEntitlement } from "@/lib/db/queries/account";

/**
 * Order Status Timeline — horizontal 4-step progress strip.
 *
 * Steps:
 *   1. Order received     — always done (the order row exists)
 *   2. Processing          — true while any entitlement is still pending
 *   3. Preparing           — same window as "Processing" but later in the
 *                            visual progression; tracks watermark-job state
 *   4. Completed           — every entitlement reached `ready` or `revoked`
 *
 * State derivation is pure data — no client interactivity. The
 * `<FulfillmentPoller>` higher up in the page already revalidates the
 * route as entitlements flip status, so the timeline re-renders with
 * fresh state on each poll.
 *
 * Pure Server Component.
 */

type StepKey = "received" | "processing" | "preparing" | "completed";

interface StepDef {
  key: StepKey;
  label: string;
  icon: typeof Check;
}

const STEPS: ReadonlyArray<StepDef> = [
  { key: "received", label: "Order received", icon: Inbox },
  { key: "processing", label: "Processing", icon: Sparkles },
  { key: "preparing", label: "Preparing", icon: FileCheck },
  { key: "completed", label: "Completed", icon: Check },
];

type StepState = "done" | "active" | "upcoming";

/**
 * Derive the visual state of every step from the entitlement list.
 *
 *   - 0 entitlements ready  → received=done, processing=active, others=upcoming
 *   - some ready, some pending → received=done, processing=done,
 *                                 preparing=active, completed=upcoming
 *   - all ready (or revoked) → all four = done
 */
function deriveStepStates(
  entitlements: ReadonlyArray<OrderEntitlement>,
): Record<StepKey, StepState> {
  if (entitlements.length === 0) {
    return {
      received: "done",
      processing: "active",
      preparing: "upcoming",
      completed: "upcoming",
    };
  }

  const allResolved = entitlements.every(
    (e) => e.status === "ready" || e.status === "revoked",
  );
  if (allResolved) {
    return {
      received: "done",
      processing: "done",
      preparing: "done",
      completed: "done",
    };
  }

  const someReady = entitlements.some((e) => e.status === "ready");
  if (someReady) {
    // Mixed state — preparing is the visible active stage.
    return {
      received: "done",
      processing: "done",
      preparing: "active",
      completed: "upcoming",
    };
  }

  // All pending.
  return {
    received: "done",
    processing: "active",
    preparing: "upcoming",
    completed: "upcoming",
  };
}

export function OrderStatusTimeline({
  entitlements,
}: {
  entitlements: ReadonlyArray<OrderEntitlement>;
}) {
  const states = deriveStepStates(entitlements);

  return (
    <section
      aria-label="Order fulfillment status"
      className="home-glass relative overflow-hidden rounded-[28px] p-6 sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-bright/40 to-transparent"
      />

      <header className="flex items-baseline justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-soft">
          Order status
        </p>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-bright">
          {states.completed === "done" ? "Completed" : "In progress"}
        </p>
      </header>

      {/* Steps — horizontal on lg+, vertical on small screens for clarity. */}
      <ol className="relative mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {/* Connector line behind icons on lg+ (decorative, drawn under
            the icons in the grid's vertical center) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[10%] right-[10%] top-[22px] hidden h-px bg-white/[0.08] lg:block"
        />
        {/* Emerald progress segment — grows with active step */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[10%] top-[22px] hidden h-px bg-gradient-to-r from-emerald-bright/60 to-emerald-bright/0 lg:block"
          style={{ width: `${progressWidth(states)}%` }}
        />

        {STEPS.map((step) => {
          const state = states[step.key];
          return <Step key={step.key} step={step} state={state} />;
        })}
      </ol>
    </section>
  );
}

/** % width for the emerald progress segment (rough — 4 steps, 25% each). */
function progressWidth(states: Record<StepKey, StepState>): number {
  if (states.completed === "done") return 80; // full
  if (states.preparing === "active") return 55;
  if (states.processing === "active") return 25;
  return 0;
}

function Step({ step, state }: { step: StepDef; state: StepState }) {
  const Icon = step.icon;
  const isDone = state === "done";
  const isActive = state === "active";

  return (
    <li className="relative flex items-start gap-3 lg:flex-col lg:items-center lg:gap-2 lg:text-center">
      {/* Icon disc */}
      <span
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
          isDone
            ? "border-emerald-bright/40 bg-emerald-bright/12 text-emerald-bright shadow-[0_0_14px_-2px_rgba(51,240,170,0.5)]"
            : isActive
              ? "border-emerald-bright/50 bg-emerald-bright/16 text-emerald-bright shadow-[0_0_18px_-2px_rgba(51,240,170,0.7)]"
              : "border-white/[0.08] bg-white/[0.02] text-fg-fade"
        }`}
      >
        {isActive ? (
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full bg-emerald-bright/30"
            />
            <Icon aria-hidden className="relative h-4 w-4" strokeWidth={1.8} />
          </span>
        ) : (
          <Icon aria-hidden className="h-4 w-4" strokeWidth={1.8} />
        )}
      </span>

      {/* Label */}
      <div className="min-w-0">
        <p
          className={`font-serif text-[15px] font-medium leading-tight ${
            isDone || isActive ? "text-fg-hi" : "text-fg-mid"
          }`}
        >
          {step.label}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-fg-soft">
          {isDone ? "Done" : isActive ? "In progress" : "Upcoming"}
        </p>
      </div>
    </li>
  );
}
