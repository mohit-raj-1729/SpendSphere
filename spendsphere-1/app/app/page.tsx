import { useEffect, useState } from 'react';

const mockSummary = {
  month: "This month",
  totalBalance: 15700,
  income: 8500,
  expense: 6222,
  currency: "USD",
  totalTransactions: 50,
  incomeTransactions: 27,
  expenseTransactions: 23,
};

export default function AppDashboard() {
  const [summary, setSummary] = useState(mockSummary);

  useEffect(() => {
    const fetchSummary = async () => {
      const response = await fetch('/api/summary');
      const data = await response.json();
      setSummary(data);
    };

    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-slate-100">
          <div className="w-9 h-9 rounded-2xl bg-violet-500 flex items-center justify-center text-white font-bold">
            F
          </div>
          <div>
            <div className="text-sm font-semibold">FlowFunds</div>
            <div className="text-[11px] text-slate-400">Smart budgeting</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
          <SidebarItem label="Dashboard" />
          <SidebarItem label="Transactions" />
          <SidebarItem label="Wallet" />
          <SidebarItem label="Goals" />
          <SidebarItem label="Budget" />
          <SidebarItem label="Analytics" active />
          <SidebarItem label="Settings" />
        </nav>

        <div className="px-4 pb-4 pt-2 border-t border-slate-100 text-xs space-y-2">
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100">
            <span>Help</span>
          </button>
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50">
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-20 px-8 border-b border-slate-200 bg-white flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Analytics</h1>
            <p className="text-xs text-slate-400">
              Detailed overview of your financial situation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 bg-slate-50">
              <span>📅</span>
              <span>This month</span>
            </button>
            <button className="px-3 py-1.5 rounded-full text-xs bg-slate-100 text-slate-600">
              Manage widgets
            </button>
            <button className="px-3 py-1.5 rounded-full text-xs bg-violet-500 text-white font-medium">
              + Add new widget
            </button>
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Top cards */}
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total balance"
              amount={summary.totalBalance}
              currency={summary.currency}
              change="+12.1%"
              sub={`You have extra $1,700\ncompared to last month`}
              badge="50 transactions • 15 categories"
            />
            <StatCard
              title="Income"
              amount={summary.income}
              currency={summary.currency}
              change="+6.3%"
              sub="You earn extra $500 compared to last month"
              badge="27 transactions • 8 categories"
            />
            <StatCard
              title="Expense"
              amount={summary.expense}
              currency={summary.currency}
              change="-7.2%"
              negative
              sub="You spent extra $1,222 compared to last month"
              badge="23 transactions • 6 categories"
            />
          </section>

          {/* Middle: total balance overview + stats */}
          <section className="grid gap-4 lg:grid-cols-[2.2fr,1.1fr]">
            {/* Total balance overview (fake area chart) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold">Total balance overview</h2>
                  <p className="text-[11px] text-slate-400">{summary.month}</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100">
                    This month
                  </span>
                  <span>Same period last month</span>
                  <span>Total balance</span>
                </div>
              </div>
              <div className="h-40 bg-slate-50 rounded-2xl relative overflow-hidden">
                {/* Simple fake line/area representation */}
                <div className="absolute inset-x-4 bottom-6 flex items-end gap-4">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => (
                    <div key={m} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-16 bg-gradient-to-t from-violet-200 to-violet-400 rounded-full opacity-70" />
                      <span className="text-[10px] text-slate-400">{m}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute left-6 top-6 px-2 py-1 rounded-full bg-white shadow text-[10px] text-slate-600">
                  ${summary.totalBalance.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Statistics donut */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold">Statistics</h2>
                  <p className="text-[11px] text-slate-400">This month expense</p>
                </div>
                <div className="flex gap-2 text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100">
                    Expense
                  </span>
                  <span>Details</span>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-between gap-4">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-[10px] border-slate-100" />
                  <div className="absolute inset-1 rounded-full border-[10px] border-violet-400 border-t-transparent border-l-transparent rotate-[-45deg]" />
                  <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-400">This month</span>
                    <span className="text-sm font-semibold">
                      ${summary.expense.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-[11px]">
                  <LegendItem color="bg-violet-500" label="Money transfer" value="24%" />
                  <LegendItem color="bg-indigo-400" label="Cafes & Restaurants" value="18%" />
                  <LegendItem color="bg-sky-400" label="Rent" value="30%" />
                  <LegendItem color="bg-emerald-400" label="Education" value="12%" />
                  <LegendItem color="bg-amber-400" label="Food & Groceries" value="16%" />
                </div>
              </div>
            </div>
          </section>

          {/* Bottom: comparing budget and expense */}
          <section className="bg-white rounded-3xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">
                  Comparing of budget and expense
                </h2>
                <p className="text-[11px] text-slate-400">This year</p>
              </div>
              <div className="flex gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-violet-400" /> Expense
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-slate-300" /> Budget
                </span>
              </div>
            </div>
            <div className="h-40 flex items-end gap-4 px-4">
              {["Jan", "Feb", "Mar", "Apr", "May"].map((m, i) => (
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-7 rounded-t-xl bg-slate-200 h-16 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 bg-violet-400 h-10 rounded-t-xl" />
                  </div>
                  <span className="text-[10px] text-slate-400">{m}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ label, active = false }) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left ${
        active
          ? "bg-violet-500 text-white font-medium"
          : "text-slate-600 hover:bg-slate-100"
      } text-xs`}
    >
      <span>{label}</span>
    </button>
  );
}

function StatCard({
  title,
  amount,
  currency,
  change,
  sub,
  badge,
  negative,
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[11px] text-slate-400">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold">
              {currency} {amount.toLocaleString()}
            </span>
          </div>
        </div>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full ${
            negative ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"
          }`}
        >
          {change}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 whitespace-pre-line mb-2">{sub}</p>
      <p className="text-[10px] text-slate-400">{badge}</p>
    </div>
  );
}

function LegendItem({
  color,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-slate-600">{label}</span>
      </div>
      <span className="text-slate-500">{value}</span>
    </div>
  );
}