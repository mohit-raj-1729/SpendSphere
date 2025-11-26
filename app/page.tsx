import image from "next/image";

// app/page.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-violet-500 flex items-center justify-center text-white font-bold">
            F
          </div>
          <div>
            <div className="text-sm font-semibold">FlowFunds</div>
            <div className="text-[11px] text-slate-400">Smart budgeting</div>
          </div>
        </div>
        <nav className="flex gap-3 text-sm">
          <a
            href="/app"
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            Dashboard
          </a>
          <a
            href="/coach"
            className="px-3 py-1.5 rounded-full bg-violet-500 text-white text-xs font-semibold hover:bg-violet-600"
          >
            Talk to Coach
          </a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">
            Automated Budgeting & Real-Time Insights
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Your money, in one honest dashboard.
          </h1>
          <p className="max-w-xl mx-auto text-sm text-slate-600 mb-8">
            FlowFunds watches your spending patterns, builds smart budgets, and
            explains your month in plain language — not bank jargon.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/app"
              className="px-5 py-2.5 rounded-full bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-colors"
            >
              Start saving
            </a>
            <a
              href="/coach"
              className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Talk to the Money Coach
            </a>
          </div>
        </div>

        {/* Feature cards preview */}
        <div className="mt-16 grid gap-4 md:grid-cols-3 max-w-4xl w-full px-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 text-left">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center mb-3">
              <span className="text-violet-600 text-lg">📊</span>
            </div>
            <h3 className="text-sm font-semibold mb-1">Analytics</h3>
            <p className="text-xs text-slate-500">
              Detailed overview of your financial situation with charts and insights.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-4 text-left">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center mb-3">
              <span className="text-violet-600 text-lg">💰</span>
            </div>
            <h3 className="text-sm font-semibold mb-1">Smart Budgets</h3>
            <p className="text-xs text-slate-500">
              Set limits for categories and track your spending against them.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-4 text-left">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center mb-3">
              <span className="text-violet-600 text-lg">🎯</span>
            </div>
            <h3 className="text-sm font-semibold mb-1">Goals</h3>
            <p className="text-xs text-slate-500">
              Track your savings goals and get tips from the money coach.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}import Image from "next/image";

// app/page.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-violet-500 flex items-center justify-center text-white font-bold">
            F
          </div>
          <div>
            <div className="text-sm font-semibold">FlowFunds</div>
            <div className="text-[11px] text-slate-400">Smart budgeting</div>
          </div>
        </div>
        <nav className="flex gap-3 text-sm">
          <a
            href="/app"
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            Dashboard
          </a>
          <a
            href="/coach"
            className="px-3 py-1.5 rounded-full bg-violet-500 text-white text-xs font-semibold hover:bg-violet-600"
          >
            Talk to Coach
          </a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">
            Automated Budgeting & Real-Time Insights
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Your money, in one honest dashboard.
          </h1>
          <p className="max-w-xl mx-auto text-sm text-slate-600 mb-8">
            FlowFunds watches your spending patterns, builds smart budgets, and
            explains your month in plain language — not bank jargon.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/app"
              className="px-5 py-2.5 rounded-full bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-colors"
            >
              Start saving
            </a>
            <a
              href="/coach"
              className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Talk to the Money Coach
            </a>
          </div>
        </div>

        {/* Feature cards preview */}
        <div className="mt-16 grid gap-4 md:grid-cols-3 max-w-4xl w-full px-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 text-left">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center mb-3">
              <span className="text-violet-600 text-lg">📊</span>
            </div>
            <h3 className="text-sm font-semibold mb-1">Analytics</h3>
            <p className="text-xs text-slate-500">
              Detailed overview of your financial situation with charts and insights.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-4 text-left">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center mb-3">
              <span className="text-violet-600 text-lg">💰</span>
            </div>
            <h3 className="text-sm font-semibold mb-1">Smart Budgets</h3>
            <p className="text-xs text-slate-500">
              Set limits for categories and track your spending against them.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-4 text-left">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center mb-3">
              <span className="text-violet-600 text-lg">🎯</span>
            </div>
            <h3 className="text-sm font-semibold mb-1">Goals</h3>
            <p className="text-xs text-slate-500">
              Track your savings goals and get tips from the money coach.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}