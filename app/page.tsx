import image from "next/image";

// app/page.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center">
      <div className="w-full max-w-4xl flex-1 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
            <span className="relative text-xs font-extrabold tracking-tighter">SS</span>
          </div>
          <div>
            <div className="text-sm font-semibold">SpendSphere</div>
            <div className="text-[11px] text-slate-400">Smart budgeting</div>
          </div>
        </div>
        <nav className="flex gap-3 text-sm">
          <a
            href="/auth"
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            Log in
          </a>
          <a
            href="/auth"
            className="px-3 py-1.5 rounded-full bg-violet-500 text-white text-xs font-semibold hover:bg-violet-600"
          >
            Sign up
          </a>
        </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">
            Automated Budgeting & Real-Time Insights
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Your money, in one honest dashboard.
          </h1>
          <p className="max-w-xl mx-auto text-sm text-slate-600 mb-8">
            SpendSphere watches your spending patterns, builds smart budgets, and
            explains your month in plain language — not bank jargon.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/auth"
              className="px-5 py-2.5 rounded-full bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-colors"
            >
              Get started
            </a>
            <a
              href="/coach"
              className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Talk to the Money Coach
            </a>
          </div>
        </div>
        </div>

        {/* Feature cards preview */}
        <div className="mt-16 grid gap-4 md:grid-cols-3 w-full px-4 sm:px-6 lg:px-10">
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
    </div>
  );
}