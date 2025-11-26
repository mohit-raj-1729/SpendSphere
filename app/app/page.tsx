"use client";

import { useEffect, useState } from "react";

type Summary = {
  month: string;
  totalBalance: number;
  income: number;
  expense: number;
  currency: string;
  totalTransactions: number;
  incomeTransactions: number;
  expenseTransactions: number;
};

type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  merchant?: string | null;
};

export default function AppDashboard() {
  const [activeSection, setActiveSection] = useState<
    "Dashboard" | "Transactions" | "Wallet" | "Goals" | "Budget" | "Analytics" | "Settings"
  >("Analytics");

  // Summary - NO MOCK DATA, starts as null
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Transactions - NO MOCK DATA, starts empty
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | "income" | "expense">(
    "all"
  );

  // Money coach
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachAnswer, setCoachAnswer] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  // Default summary when no data (all zeros)
  const defaultSummary: Summary = {
    month: "This month",
    totalBalance: 0,
    income: 0,
    expense: 0,
    currency: "INR",
    totalTransactions: 0,
    incomeTransactions: 0,
    expenseTransactions: 0,
  };

  const s = summary ?? defaultSummary;

  useEffect(() => {
    void loadSummary();
    void loadTransactions();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      void loadSummary();
      void loadTransactions();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadSummary() {
    try {
      setLoadingSummary(true);
      setSummaryError(null);

      const res = await fetch("/api/summary");
      if (!res.ok) {
        throw new Error(`Summary API error: ${res.status}`);
      }

      const data = (await res.json()) as Summary;
      setSummary(data);
    } catch (err) {
      console.error("Summary API request failed", err);
      setSummaryError("Could not load summary.");
      setSummary(null); // Will use defaultSummary (all zeros)
    } finally {
      setLoadingSummary(false);
    }
  }

  async function loadTransactions() {
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);

      const res = await fetch("/api/transactions");
      if (!res.ok) {
        throw new Error(`Transactions API error: ${res.status}`);
      }

      const data = (await res.json()) as Transaction[];

      if (!Array.isArray(data)) {
        setTransactions([]);
      } else {
        setTransactions(data);
      }
    } catch (err) {
      console.error("Transactions API request failed", err);
      setTransactionsError("Could not load transactions.");
      setTransactions([]); // NO MOCK DATA - empty array
    } finally {
      setTransactionsLoading(false);
    }
  }

  async function handleCoachAsk() {
    if (!coachQuestion.trim()) return;

    try {
      setCoachLoading(true);
      setCoachError(null);
      setCoachAnswer("");

      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: coachQuestion }),
      });

      if (!res.ok) {
        throw new Error(`Coach API error: ${res.status}`);
      }

      const data = await res.json();
      setCoachAnswer(data.answer ?? "No answer returned.");
    } catch (err) {
      console.error("Coach API request failed", err);
      setCoachError("Money coach is not available right now.");
    } finally {
      setCoachLoading(false);
    }
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesType =
      transactionTypeFilter === "all" ? true : t.type === transactionTypeFilter;
    const matchesSearch =
      !transactionSearch.trim() ||
      t.description.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(transactionSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate category totals from real transactions
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

  const budgetByCategory = Object.entries(categoryTotals).map(([cat, spent]) => ({
    id: cat,
    name: cat,
    limit: spent * 1.2, // Budget is 20% more than spent
    spent,
  }));

  const headerTitleMap: Record<typeof activeSection, string> = {
    Dashboard: "Dashboard",
    Transactions: "Transactions",
    Wallet: "Wallet",
    Goals: "Goals",
    Budget: "Budget",
    Analytics: "Analytics",
    Settings: "Settings",
  };

  const headerSubMap: Record<typeof activeSection, string> = {
    Dashboard: "Quick overview of your money and actions",
    Transactions: "List and filter your income and expenses",
    Wallet: "See balances across your accounts",
    Goals: "Track your savings goals and ask a money coach",
    Budget: "Compare your spending against planned limits",
    Analytics: "Detailed overview of your financial situation",
    Settings: "Tweak preferences and safety options",
  };

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
          <SidebarItem
            label="Dashboard"
            active={activeSection === "Dashboard"}
            onClick={() => setActiveSection("Dashboard")}
          />
          <SidebarItem
            label="Transactions"
            active={activeSection === "Transactions"}
            onClick={() => setActiveSection("Transactions")}
          />
          <SidebarItem
            label="Wallet"
            active={activeSection === "Wallet"}
            onClick={() => setActiveSection("Wallet")}
          />
          <SidebarItem
            label="Goals"
            active={activeSection === "Goals"}
            onClick={() => setActiveSection("Goals")}
          />
          <SidebarItem
            label="Budget"
            active={activeSection === "Budget"}
            onClick={() => setActiveSection("Budget")}
          />
          <SidebarItem
            label="Analytics"
            active={activeSection === "Analytics"}
            onClick={() => setActiveSection("Analytics")}
          />
          <SidebarItem
            label="Settings"
            active={activeSection === "Settings"}
            onClick={() => setActiveSection("Settings")}
          />
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
            <h1 className="text-xl font-semibold">{headerTitleMap[activeSection]}</h1>
            <p className="text-xs text-slate-400">{headerSubMap[activeSection]}</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/import"
              className="px-3 py-1.5 rounded-full text-xs bg-violet-500 text-white font-medium"
            >
              Import CSV
            </a>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 bg-slate-50">
              <span>📅</span>
              <span>{s.month}</span>
            </button>
            <button
              className="px-3 py-1.5 rounded-full text-xs bg-slate-100 text-slate-600"
              onClick={() => {
                void loadSummary();
                void loadTransactions();
              }}
            >
              {loadingSummary ? "Refreshing..." : "🔄 Refresh"}
            </button>
            <button
              className="px-3 py-1.5 rounded-full text-xs bg-violet-500 text-white font-medium"
              onClick={() => setActiveSection("Goals")}
            >
              Ask money coach
            </button>
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Analytics */}
          {activeSection === "Analytics" && (
            <>
              {summaryError && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-2xl mb-2">
                  {summaryError}
                </p>
              )}

              {/* Top cards */}
              <section className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Total balance"
                  amount={s.totalBalance}
                  currency={s.currency}
                  change={s.totalTransactions > 0 ? "+0%" : "0%"}
                  sub={s.totalTransactions > 0 ? `Based on ${s.totalTransactions} transactions` : "No transactions yet. Import CSV to get started."}
                  badge={`${s.totalTransactions} transactions • ${s.incomeTransactions} income / ${s.expenseTransactions} expense`}
                />
                <StatCard
                  title="Income"
                  amount={s.income}
                  currency={s.currency}
                  change={s.incomeTransactions > 0 ? "+0%" : "0%"}
                  sub={s.incomeTransactions > 0 ? `${s.incomeTransactions} income transactions` : "No income recorded"}
                  badge={`${s.incomeTransactions} income transactions`}
                />
                <StatCard
                  title="Expense"
                  amount={s.expense}
                  currency={s.currency}
                  change={s.expenseTransactions > 0 ? "-0%" : "0%"}
                  negative
                  sub={s.expenseTransactions > 0 ? `${s.expenseTransactions} expense transactions` : "No expenses recorded"}
                  badge={`${s.expenseTransactions} expense transactions`}
                />
              </section>

              {/* Middle: total balance overview + stats */}
              <section className="grid gap-4 lg:grid-cols-[2.2fr,1.1fr]">
                <div className="bg-white rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-semibold">Total balance overview</h2>
                      <p className="text-[11px] text-slate-400">{s.month}</p>
                    </div>
                  </div>
                  <div className="h-40 bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center">
                    {s.totalBalance === 0 ? (
                      <p className="text-xs text-slate-400">No data to display</p>
                    ) : (
                      <div className="absolute left-6 top-6 px-2 py-1 rounded-full bg-white shadow text-[10px] text-slate-600">
                        ₹{s.totalBalance.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-semibold">Statistics</h2>
                      <p className="text-[11px] text-slate-400">This month expense</p>
                    </div>
                  </div>
                  {s.expense === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-8">
                      <p className="text-xs text-slate-400">No expenses this month</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between gap-4">
                      <div className="relative w-32 h-32">
                        <div className="absolute inset-0 rounded-full border-[10px] border-slate-100" />
                        <div className="absolute inset-1 rounded-full border-[10px] border-violet-400 border-t-transparent border-l-transparent rotate-[-45deg]" />
                        <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center">
                          <span className="text-[10px] text-slate-400">This month</span>
                          <span className="text-sm font-semibold">
                            ₹{s.expense.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 text-[11px]">
                        {Object.entries(categoryTotals).slice(0, 5).map(([cat, amt]) => {
                          const pct = Math.round((amt / s.expense) * 100);
                          return (
                            <LegendItem
                              key={cat}
                              color="bg-violet-500"
                              label={cat}
                              value={`${pct}%`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Budget comparison */}
              <section className="bg-white rounded-3xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-semibold">Comparing budget and expense</h2>
                    <p className="text-[11px] text-slate-400">This month</p>
                  </div>
                </div>
                {budgetByCategory.length === 0 ? (
                  <div className="h-40 flex items-center justify-center">
                    <p className="text-xs text-slate-400">No budget data. Import CSV to see your spending breakdown.</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-[11px]">
                    {budgetByCategory.map((b) => {
                      const pct = Math.round((b.spent / b.limit) * 100);
                      return (
                        <div key={b.id} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-600">{b.name}</span>
                            <span className="text-slate-500">
                              ₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct > 100 ? "bg-rose-400" : "bg-violet-400"
                              }`}
                              style={{ width: `${Math.min(pct, 120)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {/* Transactions */}
          {activeSection === "Transactions" && (
            <section className="bg-white rounded-3xl border border-slate-200 p-4 text-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">
                    View and filter your recent income and expenses.
                  </p>
                  {transactionsError && (
                    <p className="text-[11px] text-amber-600 mt-1">{transactionsError}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Search description or category..."
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    className="px-3 py-1.5 rounded-full border border-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  />
                  <select
                    value={transactionTypeFilter}
                    onChange={(e) =>
                      setTransactionTypeFilter(e.target.value as "all" | "income" | "expense")
                    }
                    className="px-3 py-1.5 rounded-full border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-violet-400"
                  >
                    <option value="all">All</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <button
                    onClick={loadTransactions}
                    className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700"
                  >
                    {transactionsLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs">
                <div className="px-3 py-2 rounded-2xl bg-emerald-50 text-emerald-700">
                  Income: ₹{totalIncome.toLocaleString()}
                </div>
                <div className="px-3 py-2 rounded-2xl bg-rose-50 text-rose-700">
                  Expense: ₹{totalExpense.toLocaleString()}
                </div>
                <div className="px-3 py-2 rounded-2xl bg-slate-50 text-slate-700">
                  Net: ₹{(totalIncome - totalExpense).toLocaleString()}
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="text-left px-4 py-2">Date</th>
                      <th className="text-left px-4 py-2">Description</th>
                      <th className="text-left px-4 py-2">Category</th>
                      <th className="text-right px-4 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-slate-400 text-[11px]"
                        >
                          {transactions.length === 0 ? (
                            <>
                              No transactions yet.{" "}
                              <a href="/import" className="text-violet-500 hover:underline">
                                Import your bank CSV
                              </a>{" "}
                              to get started.
                            </>
                          ) : (
                            "No transactions match your filters."
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((t) => (
                        <tr key={t.id} className="border-t border-slate-100">
                          <td className="px-4 py-2 text-slate-500">{t.date}</td>
                          <td className="px-4 py-2 text-slate-700">{t.description}</td>
                          <td className="px-4 py-2 text-slate-500">{t.category}</td>
                          <td
                            className={`px-4 py-2 text-right font-medium ${
                              t.type === "income" ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {t.type === "income" ? "+" : "-"}₹{Number(t.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Other sections - simplified */}
          {activeSection === "Dashboard" && (
            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Total balance"
                  amount={s.totalBalance}
                  currency={s.currency}
                  change="0%"
                  sub="Your money across all transactions."
                  badge={`${s.totalTransactions} transactions this month`}
                />
                <StatCard
                  title="Income"
                  amount={s.income}
                  currency={s.currency}
                  change="0%"
                  sub="Total income this month."
                  badge={`${s.incomeTransactions} income transactions`}
                />
                <StatCard
                  title="Expense"
                  amount={s.expense}
                  currency={s.currency}
                  change="0%"
                  negative
                  sub="Total expenses this month."
                  badge={`${s.expenseTransactions} expense transactions`}
                />
              </div>
            </section>
          )}

          {activeSection === "Budget" && (
            <section className="bg-white rounded-3xl border border-slate-200 p-4 text-sm space-y-4">
              <p className="text-xs text-slate-500">
                Compare how much you planned to spend vs what you actually spent.
              </p>
              {budgetByCategory.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <p>No budget data yet.</p>
                  <p className="mt-1">
                    <a href="/import" className="text-violet-500 hover:underline">
                      Import your bank CSV
                    </a>{" "}
                    to see your spending breakdown.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {budgetByCategory.map((b) => {
                    const usedPercent = Math.min(100, Math.round((b.spent / b.limit) * 100));
                    const over = b.spent > b.limit;
                    return (
                      <div
                        key={b.id}
                        className="border border-slate-100 rounded-2xl px-4 py-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-700">{b.name}</span>
                          <span
                            className={`${
                              over ? "text-rose-600" : "text-slate-500"
                            } font-medium`}
                          >
                            {usedPercent}% used
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full ${
                              over ? "bg-rose-500" : "bg-violet-500"
                            }`}
                            style={{ width: `${Math.min(100, usedPercent)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            Spent: ₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()}
                          </span>
                          {over && <span className="text-rose-500">Over budget</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeSection === "Goals" && (
            <section className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-4 text-sm">
                <h2 className="text-sm font-semibold mb-2">Ask the money coach</h2>
                <p className="text-[11px] text-slate-500 mb-2">
                  Ask for short, practical tips about your finances.
                </p>
                <textarea
                  className="w-full text-xs border border-slate-200 rounded-2xl px-3 py-2 mb-2 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  rows={4}
                  value={coachQuestion}
                  onChange={(e) => setCoachQuestion(e.target.value)}
                  placeholder="Example: How can I save more money?"
                />
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={handleCoachAsk}
                    disabled={coachLoading || !coachQuestion.trim()}
                    className="px-3 py-1.5 rounded-full text-xs bg-violet-500 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {coachLoading ? "Asking coach..." : "Ask coach"}
                  </button>
                  {coachError && (
                    <span className="text-[11px] text-rose-500">{coachError}</span>
                  )}
                </div>
                {coachAnswer && (
                  <div className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 whitespace-pre-line">
                    {coachAnswer}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeSection === "Wallet" && (
            <section className="bg-white rounded-3xl border border-slate-200 p-4 text-sm space-y-4">
              <p className="text-xs text-slate-400">Wallet feature coming soon.</p>
            </section>
          )}

          {activeSection === "Settings" && (
            <section className="bg-white rounded-3xl border border-slate-200 p-4 text-sm space-y-4">
              <p className="text-xs text-slate-400">Settings feature coming soon.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
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
}: {
  title: string;
  amount: number;
  currency: string;
  change: string;
  sub: string;
  badge: string;
  negative?: boolean;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[11px] text-slate-400">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold">
              ₹{amount.toLocaleString()}
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
}: {
  color: string;
  label: string;
  value: string;
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