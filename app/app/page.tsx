// app/app/page.tsx
const mockSummary = {
    month: "November 2025",
    income: 65000,
    expenses: 42000,
    savings: 23000,
    score: 82,
    categoryTotals: {
      Food: 9000,
      Rent: 15000,
      Travel: 4000,
      Shopping: 7000,
      Subscriptions: 3000,
    },
  };
  
  export default function AppDashboard() {
    const { month, income, expenses, savings, score, categoryTotals } = mockSummary;
  
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        {/* Top nav */}
        <header className="border-b border-slate-800/80 backdrop-blur sticky top-0 z-20 bg-slate-950/70">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/90 shadow-lg shadow-emerald-500/40" />
              <span className="font-semibold tracking-tight">FlowFunds</span>
            </div>
            <nav className="flex gap-3 text-sm">
              <a href="/" className="text-slate-400 hover:text-slate-100">
                Landing
              </a>
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
          </div>
        </header>
  
        {/* Main content */}
        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Top row: score + month summary */}
          <section className="grid gap-4 md:grid-cols-[2fr,1.2fr]">
            {/* Score card */}
            <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-5 flex flex-col md:flex-row gap-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Money Health
                </p>
                <div className="flex items-end gap-3 mt-1">
                  <p className="text-5xl font-bold leading-none">{score}</p>
                  <span className="text-xs text-emerald-400 mb-1">
                    • {month}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 max-w-md">
                  You’re on track to save{" "}
                  <span className="font-semibold text-sky-400">
                    ₹{savings.toLocaleString()}
                  </span>{" "}
                  this month. Keeping food and shopping under control pushes your
                  score into the 90s.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Savings rate: {Math.round((savings / income) * 100)}%
                  </span>
                  <span className="px-2 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
                    Expense control: {Math.round((1 - expenses / income) * 100)}%
                  </span>
                </div>
              </div>
  
              {/* Circular score visual */}
              <div className="w-40 h-40 mx-auto md:mx-0 relative">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                <div className="absolute inset-1 rounded-full border-4 border-emerald-500/80" />
                <div className="absolute inset-4 rounded-full bg-slate-950/90 flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-400">Score</span>
                  <span className="text-3xl font-bold">{score}</span>
                  <span className="text-[10px] text-emerald-400 mt-1">
                    Healthy
                  </span>
                </div>
              </div>
            </div>
  
            {/* Monthly numbers */}
            <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                This month
              </p>
              <div className="space-y-2 text-sm">
                <Row label="Income" value={income} color="text-emerald-400" />
                <Row label="Expenses" value={expenses} color="text-rose-400" />
                <Row label="Savings" value={savings} color="text-sky-400" />
              </div>
              <button className="mt-4 w-full rounded-2xl bg-slate-800/80 text-xs py-2.5 hover:bg-slate-700 transition">
                + Add quick expense
              </button>
            </div>
          </section>
  
          {/* Middle: categories + what-if */}
          <section className="grid gap-4 md:grid-cols-[2fr,1.2fr]">
            {/* Categories */}
            <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-100">
                  Spending by category
                </h2>
                <span className="text-[11px] text-slate-400">
                  Intelligent caps suggested
                </span>
              </div>
              <ul className="space-y-2 text-xs">
                {Object.entries(categoryTotals).map(([cat, amount]) => {
                  const pct = Math.round((amount / expenses) * 100);
                  return (
                    <li key={cat} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-300">{cat}</span>
                        <span className="text-slate-100">
                          ₹{amount.toLocaleString()} • {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
  
            {/* What-if card */}
            <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 mb-1">
                  What if you tweak it?
                </h2>
                <p className="text-[11px] text-slate-300 mb-3">
                  Slide your food & shopping budget. We’ll estimate your new
                  monthly savings.
                </p>
                <p className="text-xs text-emerald-300">
                  Example: Cutting ₹1,000 from eating out likely pushes savings to
                  ~₹25,000 and score to ~88.
                </p>
              </div>
              <button className="mt-4 w-full rounded-2xl bg-emerald-500/90 text-slate-950 text-xs py-2.5 font-semibold shadow-lg shadow-emerald-500/40">
                Open interactive simulator
              </button>
            </div>
          </section>
  
          {/* Bottom: coach preview */}
          <section className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-5 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-slate-100 mb-1">
                Coach insight
              </h2>
              <p className="text-xs text-slate-300 mb-2">
                “Most of your extra cash leaks into food and online shopping in
                the last 10 days of the month. Set a soft cap of ₹1,500 for those
                days and you’ll painlessly add ~₹3,000/month to savings.”
              </p>
              <p className="text-[11px] text-slate-400">
                This message is generated from your real patterns, not generic
                advice.
              </p>
            </div>
            <div className="w-full md:w-64">
              <button className="w-full rounded-2xl bg-slate-800/80 text-xs py-2.5 mb-2">
                Ask “Why did my score drop?”
              </button>
              <button className="w-full rounded-2xl bg-slate-800/80 text-xs py-2.5">
                Ask “Can I afford a new phone EMI?”
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }
  
  function Row({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) {
    return (
      <div className="flex justify-between items-center">
        <span className="text-slate-300 text-xs">{label}</span>
        <span className={`font-semibold text-xs ${color}`}>
          ₹{value.toLocaleString()}
        </span>
      </div>
    );
  }