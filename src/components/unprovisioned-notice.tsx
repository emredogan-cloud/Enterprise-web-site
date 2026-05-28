/**
 * Unprovisioned notice — a calm, on-brand stand-in shown when a dynamic
 * route cannot run because required runtime configuration is missing
 * (Clerk keys, DATABASE_URL, R2 credentials, …).
 *
 * This replaces what would otherwise be a hard 500 with a useful page that
 * tells the operator exactly which env vars to set. Server Component, no
 * client JS, no dynamic hooks — safe to render from any route segment.
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
    <main className="mx-auto max-w-2xl px-6 py-24">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Configuration required
        </p>
        <h1 className="mt-4 text-balance font-serif text-3xl font-medium leading-tight text-foreground">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
          {body}
        </p>
      </div>

      {missing.length > 0 && (
        <div className="mx-auto mt-10 max-w-md rounded-md border border-dashed border-border bg-muted/30 p-6">
          <p className="text-sm font-medium text-foreground">
            Set these environment variables:
          </p>
          <ul className="mt-3 space-y-1.5 font-mono text-sm text-muted-foreground">
            {missing.map((name) => (
              <li key={name}>· {name}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            See <code className="rounded bg-muted px-1 py-0.5">.env.example</code> for the
            full schema. Pull them from Vercel with{" "}
            <code className="rounded bg-muted px-1 py-0.5">vercel env pull .env.local</code>.
          </p>
        </div>
      )}
    </main>
  );
}
