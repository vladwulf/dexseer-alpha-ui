import { OpportunitiesList } from "@/features/opportunities/OpportunitiesList";

export function OpportunitiesPage() {
  return (
    <main className="opportunities-page mx-auto min-h-screen max-w-5xl px-4 pb-16 pt-8">
      <header className="page-intro-card mb-5">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--ds-electric)]">
          Alert performance
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">
          Best opportunities
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ds-text-secondary)]">
          Ranked alert outcomes. Open a card to inspect the entry and best-move
          candle.
        </p>
      </header>
      <OpportunitiesList />
    </main>
  );
}
