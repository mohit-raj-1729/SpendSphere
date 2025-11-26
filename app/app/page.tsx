"use client";

// app/app/page.tsx

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
};

type Wallet = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: "bank" | "card" | "cash";
};

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
};

type BudgetCategory = {
  id: string;
  name: string;
  limit: number;
  spent: number;
};

const mockSummary: Summary = {
  month: "This month",
  totalBalance: 15700,
  income: 8500,
  expense: 6222,
  currency: "INR", // was "USD"
  totalTransactions: 50,
  incomeTransactions: 27,
  expenseTransactions: 23,
};

const mockTransactions: Transaction[] = [
  {
    id: "t1",
    date: "2025-11-01",
    description: "Salary",
    category: "Income",
    type: "income",
    amount: 5000,
  },
  {
    id: "t2",
    date: "2025-11-02",
    description: "Rent",
    category: "Housing",
    type: "expense",
    amount: 1800,
  },
  {
    id: "t3",
    date: "2025-11-03",
    description: "Groceries",
    category: "Food & Groceries",
    type: "expense",
    amount: 230,
  },
  {
    id: "t4",
    date: "2025-11-04",
    description: "Coffee shop",
    category: "Cafes & Restaurants",
    type: "expense",
    amount: 18,
  },
  {
    id: "t5",
    date: "2025-11-05",
    description: "Freelance payment",
    category: "Income",
    type: "income",
    amount: 650,
  },
];

const mockWallets: Wallet[] = [
  { id: "w1", name: "Main Bank Account", balance: 9200, currency: "INR", type: "bank" },
  { id: "w2", name: "Savings Account", balance: 4100, currency: "INR", type: "bank" },
  { id: "w3", name: "Cash", balance: 400, currency: "INR", type: "cash" },
];

const mockGoals: Goal[] = [
  {
    id: "g1",
    name: "Emergency fund",
    targetAmount: 5000,
    currentAmount: 3000,
    deadline: "2026-01-01",
  },
  {
    id: "g2",
    name: "New laptop",
    targetAmount: 1500,
    currentAmount: 600,
    deadline: "2025-12-31",
  },
];

const mockBudgets: BudgetCategory[] = [
  { id: "b1", name: "Food & Groceries", limit: 600, spent: 420 },
  { id: "b2", name: "Housing", limit: 1800, spent: 1800 },
  { id: "b3", name: "Entertainment", limit: 200, spent: 130 },
  { id: "b4", name: "Transport", limit: 150, spent: 95 },
];

export default function AppDashboard() {
  const [activeSection, setActiveSection] = useState<
    "Dashboard" | "Transactions" | "Wallet" | "Goals" | "Budget" | "Analytics" | "Settings"
  >("Analytics");

  // Summary (from /api/summary, with mock fallback)
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Transactions (from /api/transactions, with mock fallback)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | "income" | "expense">(
    "all"
  );

  // Money coach (uses /api/coach)
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachAnswer, setCoachAnswer] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  const s = summary ?? mockSummary;

  useEffect(() => {
    // Load summary and transactions on first load
    void loadSummary();
    void loadTransactions();
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
      setSummaryError("Could not load summary. Showing example data instead.");
      setSummary(null); // fallback to mockSummary via `s`
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

      if (!Array.isArray(data) || data.length === 0) {
        // fallback to mock data if API returns nothing
        setTransactions(mockTransactions);
      } else {
        setTransactions(data);
      }
    } catch (err) {
      console.error("Transactions API request failed", err);
      setTransactionsError("Could not load transactions. Showing example data instead.");
      setTransactions(mockTransactions);
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
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

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
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 bg-slate-50">
              <span>📅</span>
              <span>{s.month}</span>
            </button>
            <button
              className="px-3 py-1.5 rounded-full text-xs bg-slate-100 text-slate-600"
              onClick={loadSummary}
            >
              {loadingSummary ? "Refreshing..." : "Refresh summary"}
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
          {/* Analytics (existing detailed view) */}
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
                  change="+12.1%"
                  sub={`You have extra ₹1,700\ncompared to last month`}
                  badge={`${s.totalTransactions} transactions • ${s.incomeTransactions} income / ${s.expenseTransactions} expense`}
                />
                <StatCard
                  title="Income"
                  amount={s.income}
                  currency={s.currency}
                  change="+6.3%"
                  sub="You earn extra ₹500 compared to last month"
                  badge={`${s.incomeTransactions} income transactions`}
                />
                <StatCard
                  title="Expense"
                  amount={s.expense}
                  currency={s.currency}
                  change="-7.2%"
                  negative
                  sub="You spent extra ₹1,222 compared to last month"
                  badge={`${s.expenseTransactions} expense transactions`}
                />
              </section>

              {/* Middle: total balance overview + stats */}
              <section className="grid gap-4 lg:grid-cols-[2.2fr,1.1fr]">
                {/* Total balance overview (fake area chart) */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-semibold">Total balance overview</h2>
                      <p className="text-[11px] text-slate-400">{s.month}</p>
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
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                        <div key={m} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full h-16 bg-gradient-to-t from-violet-200 to-violet-400 rounded-full opacity-70" />
                          <span className="text-[10px] text-slate-400">{m}</span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute left-6 top-6 px-2 py-1 rounded-full bg-white shadow text-[10px] text-slate-600">
                      ₹{s.totalBalance.toLocaleString()}
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
                          ₹{s.expense.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 text-[11px]">
                      <LegendItem color="bg-violet-500" label="Money transfer" value="24%" />
                      <LegendItem
                        color="bg-indigo-400"
                        label="Cafes & Restaurants"
                        value="18%"
                      />
                      <LegendItem color="bg-sky-400" label="Rent" value="30%" />
                      <LegendItem color="bg-emerald-400" label="Education" value="12%" />
                      <LegendItem
                        color="bg-amber-400"
                        label="Food & Groceries"
                        value="16%"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Bottom: comparing budget and expense */}
              <section className="bg-white rounded-3xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-semibold">Comparing budget and expense</h2>
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
                  {["Jan", "Feb", "Mar", "Apr", "May"].map((m) => (
                    <div key={m} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-7 rounded-t-xl bg-slate-200 h-16 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-violet-400 h-10 rounded-t-xl" />
                      </div>
                      <span className="text-[10px] text-slate-400">{m}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Dashboard: quick summary, next actions, coach shortcut */}
          {activeSection === "Dashboard" && (
            <section className="space-y-4">
              {summaryError && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-2xl">
                  {summaryError}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Total balance"
                  amount={s.totalBalance}
                  currency={s.currency}
                  change="+12.1%"
                  sub="Your money across all wallets."
                  badge={`${s.totalTransactions} transactions this month`}
                />
                <StatCard
                  title="Planned budgets used"
                  amount={mockBudgets.reduce((sum, b) => sum + b.spent, 0)}
                  currency={s.currency}
                  change="+3.1%"
                  sub="Total spending across all budget categories."
                  badge={`${mockBudgets.length} categories`}
                />
                <StatCard
                  title="Goals funded"
                  amount={mockGoals.reduce((sum, g) => sum + g.currentAmount, 0)}
                  currency={s.currency}
                  change="+4.5%"
                  sub="How much you have already saved towards your goals."
                  badge={`${mockGoals.length} goals`}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white rounded-3xl border border-slate-200 p-4">
                  <h2 className="text-sm font-semibold mb-2">Next helpful actions</h2>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li>• Check your latest transactions for any unusual charges.</li>
                    <li>• Move a small amount to your savings or emergency fund.</li>
                    <li>• Review monthly subscriptions you don't really use.</li>
                  </ul>
                </div>

                <QuickCoachCard />
              </div>
            </section>
          )}

          {/* Transactions: list + filters + totals */}
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
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="border-t border-slate-100">
                        <td className="px-4 py-2 text-slate-500">{t.date}</td>
                        <td className="px-4 py-2 text-slate-700">{t.description}</td>
                        <td className="px-4 py-2 text-slate-500">{t.category}</td>
                        <td
                          className={`px-4 py-2 text-right font-medium ${
                            t.type === "income" ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-4 text-center text-slate-400 text-[11px]"
                        >
                          No transactions match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Wallet: accounts overview */}
          {activeSection === "Wallet" && (
            <section className="bg-white rounded-3xl border border-slate-200 p-4 text-sm space-y-4">
              <p className="text-xs text-slate-500">
                Your balances across different accounts and wallets.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {mockWallets.map((w) => (
                  <div
                    key={w.id}
                    className="border border-slate-100 rounded-2xl px-4 py-3 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{w.type.toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400">Wallet</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">{w.name}</div>
                    <div className="text-xs text-slate-500">
                      {w.currency} {w.balance.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Goals: savings goals + coach widget */}
          {activeSection === "Goals" && (
            <section className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1.7fr,1.3fr]">
                <div className="bg-white rounded-3xl border border-slate-200 p-4 text-sm">
                  <h2 className="text-sm font-semibold mb-3">Savings goals</h2>
                  <div className="space-y-3">
                    {mockGoals.map((g) => {
                      const progress = Math.min(
                        100,
                        Math.round((g.currentAmount / g.targetAmount) * 100)
                      );
                      return (
                        <div key={g.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-700">{g.name}</span>
                            <span className="text-slate-500">
                              {progress}% • {g.currentAmount.toLocaleString()} /{" "}
                              {g.targetAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-violet-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Target date: {g.deadline}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-4 text-sm">
                  <h2 className="text-sm font-semibold mb-2">Ask the money coach</h2>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Ask for short, practical tips about your goals and budgets.
                  </p>
                  <textarea
                    className="w-full text-xs border border-slate-200 rounded-2xl px-3 py-2 mb-2 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    rows={4}
                    value={coachQuestion}
                    onChange={(e) => setCoachQuestion(e.target.value)}
                    placeholder="Example: How can I reach my emergency fund goal faster?"
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
              </div>
            </section>
          )}

          {/* Budget: categories usage */}
          {activeSection === "Budget" && (
            <section className="bg-white rounded-3xl border border-slate-200 p-4 text-sm space-y-4">
              <p className="text-xs text-slate-500">
                Compare how much you planned to spend vs what you actually spent.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {mockBudgets.map((b) => {
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
            </section>
          )}

          {/* Settings: simple toggles (pure UI for now) */}
          {activeSection === "Settings" && (
            <section className="bg-white rounded-3xl border border-slate-200 p-4 text-sm space-y-4">
              <p className="text-xs text-slate-500">
                Basic preferences (purely visual toggles in this demo).
              </p>
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between gap-4">
                  <span className="text-slate-700">Dark mode</span>
                  <input type="checkbox" className="h-4 w-4" disabled />
                </label>
                <label className="flex items-center justify-between gap-4">
                  <span className="text-slate-700">Email alerts for big expenses</span>
                  <input type="checkbox" className="h-4 w-4" disabled />
                </label>
                <label className="flex items-center justify-between gap-4">
                  <span className="text-slate-700">Round-up savings</span>
                  <input type="checkbox" className="h-4 w-4" disabled />
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                In a real app these options would be saved to your profile.
              </p>
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

function QuickCoachCard() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk() {
    if (!question.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setAnswer("");
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`Coach API error: ${res.status}`);
      const data = await res.json();
      setAnswer(data.answer ?? "No answer returned.");
    } catch (err) {
      console.error("Quick coach error", err);
      setError("Coach is not available right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4">
      <h2 className="text-sm font-semibold mb-2">Quick coach question</h2>
      <p className="text-[11px] text-slate-500 mb-2">
        Ask something like “How can I reduce my food expenses?” or
        “How much should I save every month?”.
      </p>
      <textarea
        className="w-full text-xs border border-slate-200 rounded-2xl px-3 py-2 mb-2 focus:outline-none focus:ring-1 focus:ring-violet-400"
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleAsk();
          }
        }}
        placeholder="Type your question..."
      />
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="px-3 py-1.5 rounded-full text-xs bg-violet-500 text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Asking coach..." : "Ask coach"}
        </button>
        {error && <span className="text-[11px] text-rose-500">{error}</span>}
      </div>
      {answer && (
        <div className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 whitespace-pre-line">
          {answer}
        </div>
      )}
    </div>
  );
}