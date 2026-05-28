/**
 * Calm, on-brand empty state — used wherever a catalog query returns
 * zero rows (either a truly empty DB or a yet-to-be-provisioned one).
 */
export function EmptyState({
  heading,
  body,
}: {
  heading: string;
  body: string;
}) {
  return (
    <div className="mx-auto mt-16 max-w-xl rounded-lg border border-dashed border-border px-8 py-16 text-center">
      <h2 className="font-serif text-2xl font-medium text-foreground">
        {heading}
      </h2>
      <p className="mt-3 text-pretty text-muted-foreground">{body}</p>
    </div>
  );
}
