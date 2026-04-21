export default function GlobalLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-md bg-muted" />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl border border-border bg-muted/50" />
        ))}
      </section>
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-xl border border-border bg-muted/50 lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-xl border border-border bg-muted/50" />
      </section>
    </main>
  );
}
