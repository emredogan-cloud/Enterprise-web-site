"use client";

import { useState } from "react";

type State = "idle" | "working" | "done" | "already" | "error";

/**
 * The confirm button. It posts to the same endpoint mail clients call for
 * one-click unsubscribe, so there is one code path and one thing to keep
 * working.
 */
export function UnsubscribeForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const [state, setState] = useState<State>("idle");

  async function submit() {
    setState("working");
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; status?: string }
        | null;
      if (res.ok && body?.ok) {
        setState(body.status === "not-subscribed" ? "already" : "done");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "done" || state === "already") {
    return (
      <p role="status" className="text-emerald-bright">
        {state === "done"
          ? `Done — ${email} has been removed from the list.`
          : `${email} was not on the list. Nothing to remove.`}
      </p>
    );
  }

  return (
    <div className="not-prose my-6 flex flex-col gap-3">
      <button
        type="button"
        onClick={submit}
        disabled={state === "working"}
        className="inline-flex w-fit items-center rounded-md border border-emerald-bright/40 px-5 py-2.5 text-sm font-medium text-emerald-bright transition-colors hover:bg-emerald-bright/10 disabled:opacity-60"
      >
        {state === "working" ? "Removing…" : `Unsubscribe ${email}`}
      </button>
      {state === "error" && (
        <p role="alert" className="text-sm text-red-400">
          That did not go through. Try again, or write to{" "}
          <a href="mailto:hello@valicepress.com">hello@valicepress.com</a> and we
          will remove you by hand.
        </p>
      )}
    </div>
  );
}
