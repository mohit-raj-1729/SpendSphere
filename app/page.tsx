import Image from "next/image";

// app/page.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/90 shadow-lg shadow-emerald-500/40" />
          <span className="font-semibold tracking-tight">FlowFunds</span>
        </div>
        <nav className="flex gap-3 text-sm">
          <a href="/app" className="text-slate-100 font-medium">
            Dashboard
          </a>
          <a
            href="/coach"
            className="px-3 py-1.5 rounded-full bg-emerald-500/90 text-slate-950 text-xs font-semibold"
          >
            Talk to Coach
          </a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">
          Automated Budgeting & Real-Time Insights
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Your money, in one honest dashboard.
        </h1>
        <p className="max-w-xl text-sm text-slate-300 mb-6">
          FlowFunds watches your spending patterns, builds smart budgets, and
          explains your month in plain language — not bank jargon.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/app"
            className="px-5 py-2.5 rounded-full bg-emerald-500/90 text-slate-950 text-sm font-semibold"
          >
            Open live demo
          </a>
          <a
            href="/coach"
            className="px-5 py-2.5 rounded-full bg-slate-900/80 border border-slate-700 text-sm"
          >
            Talk to the Money Coach
          </a>
        </div>
      </main>
    </div>
  );
}