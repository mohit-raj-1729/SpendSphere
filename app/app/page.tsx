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
    // Month filter
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);



  // Money coach
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachAnswer, setCoachAnswer] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  // Goals
  const [goals, setGoals] = useState<Array<{
    id: string;
    title: string;
    target_amount: number;
    current_amount: number;
    target_date: string | null;
    description: string | null;
    icon: string;
    color: string;
  }>>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<typeof goals[0] | null>(null);
  
  // Goal form state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalIcon, setGoalIcon] = useState("🎯");
  const [goalColor, setGoalColor] = useState("violet");
  const [goalSaving, setGoalSaving] = useState(false);

    // Import Modal
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importPreview, setImportPreview] = useState<Array<{
      date: string;
      description: string;
      merchant: string | null;
      amount: number;
      type: "income" | "expense";
      category: string;
    }> | null>(null);
    const [importLoading, setImportLoading] = useState(false);
    const [imported, setImported] = useState<number | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
  
    // Import functions
    const handleImportPreview = async () => {
      if (!importFile) return;
      setImportLoading(true);
      setImportError(null);
      setImported(null);
  
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("mode", "preview");
  
      const res = await fetch("/api/import-bank", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        setImportError("Failed to parse file. Please check CSV format.");
        setImportLoading(false);
        return;
      }
  
      const data = await res.json();
      setImportPreview(data.transactions || []);
      setImportLoading(false);
    };
  
    const handleImportSubmit = async () => {
      if (!importFile) return;
  
      setImportLoading(true);
      setImportError(null);
  
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("mode", "import");
  
      const res = await fetch("/api/import-bank", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setImportError(data.error || "Import failed.");
        setImportLoading(false);
        return;
      }
  
      setImported(data.imported || 0);
      setImportLoading(false);
  
      // Refresh data and close modal after 1.5 seconds
      setTimeout(() => {
        void loadSummary();
        void loadTransactions();
        void loadGoals();
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview(null);
        setImported(null);
      }, 1500);
    };
  
    const resetImportModal = () => {
      setImportFile(null);
      setImportPreview(null);
      setImported(null);
      setImportError(null);
      setShowImportModal(false);
    };

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

  // Load goals
  async function loadGoals() {
    try {
      setGoalsLoading(true);
      const res = await fetch("/api/goals");
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (err) {
      console.error("Failed to load goals", err);
    } finally {
      setGoalsLoading(false);
    }
  }

  // Save goal
  async function saveGoal() {
    if (!goalTitle.trim() || !goalTarget) return;

    setGoalSaving(true);
    try {
      const goalData = {
        title: goalTitle.trim(),
        target_amount: Number(goalTarget),
        target_date: goalDate || null,
        description: goalDescription.trim() || null,
        icon: goalIcon,
        color: goalColor,
      };

      if (editingGoal) {
        // Update existing goal
        const res = await fetch(`/api/goals/${editingGoal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goalData),
        });
        if (!res.ok) throw new Error("Failed to update goal");
      } else {
        // Create new goal
        const res = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goalData),
        });
        if (!res.ok) throw new Error("Failed to create goal");
      }

      // Reset form
      setGoalTitle("");
      setGoalTarget("");
      setGoalDate("");
      setGoalDescription("");
      setGoalIcon("🎯");
      setGoalColor("violet");
      setShowGoalForm(false);
      setEditingGoal(null);
      await loadGoals();
    } catch (err) {
      console.error("Failed to save goal", err);
      alert("Failed to save goal. Please try again.");
    } finally {
      setGoalSaving(false);
    }
  }

  // Delete goal
  async function deleteGoal(id: string) {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete goal");
      await loadGoals();
    } catch (err) {
      console.error("Failed to delete goal", err);
      alert("Failed to delete goal. Please try again.");
    }
  }

  // Edit goal
  function editGoal(goal: typeof goals[0]) {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalTarget(goal.target_amount.toString());
    setGoalDate(goal.target_date || "");
    setGoalDescription(goal.description || "");
    setGoalIcon(goal.icon);
    setGoalColor(goal.color);
    setShowGoalForm(true);
  }
    // Get available months from transactions
    const getAvailableMonths = (): string[] => {
      const months = new Set<string>();
      transactions.forEach((t) => {
        const date = new Date(t.date);
        if (!isNaN(date.getTime())) {
          const monthKey = date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
          months.add(monthKey);
        }
      });
      return Array.from(months).sort().reverse(); // Most recent first
    };
  
    // Filter transactions by selected month
    const getFilteredTransactions = () => {
      if (!selectedMonth) return transactions;
      return transactions.filter((t) => {
        const date = new Date(t.date);
        const monthKey = date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        return monthKey === selectedMonth;
      });
    };

  useEffect(() => {
    void loadSummary();
    void loadTransactions();
    void loadGoals();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      void loadSummary();
      void loadTransactions();
      void loadGoals();
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 bg-slate-50 relative group cursor-pointer">
              <span>📅</span>
              <span>{selectedMonth || s.month}</span>
              {getAvailableMonths().length > 1 && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[200px] hidden group-hover:block">
                  <div className="p-2">
                    <button
                      onClick={() => setSelectedMonth(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 ${
                        !selectedMonth ? "bg-violet-50 text-violet-600" : ""
                      }`}
                    >
                      All Months ({s.month})
                    </button>
                    {getAvailableMonths().map((month) => (
                      <button
                        key={month}
                        onClick={() => setSelectedMonth(month)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 ${
                          selectedMonth === month ? "bg-violet-50 text-violet-600" : ""
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
          <button
              onClick={() => setShowImportModal(true)}
              className="px-3 py-1.5 rounded-full text-xs bg-violet-500 text-white font-medium hover:bg-violet-600"
            >
              Import CSV
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 bg-slate-50">
              <span>📅</span>
              <span>{s.month}</span>
            </button>
            <button
              className="px-3 py-1.5 rounded-full text-xs bg-slate-100 text-slate-600"
              onClick={() => {
                void loadSummary();
                void loadTransactions();
                void loadGoals();
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

              {/* Goals Overview */}
              {goals.length > 0 && (
                <section className="bg-white rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-semibold">Savings Goals</h2>
                      <p className="text-[11px] text-slate-400">Track your progress</p>
                    </div>
                    <button
                      onClick={() => setActiveSection("Goals")}
                      className="text-xs text-violet-600 hover:text-violet-700"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {goals.slice(0, 2).map((goal) => {
                      const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                      return (
                        <div key={goal.id} className="p-3 bg-slate-50 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{goal.icon}</span>
                            <span className="text-xs font-semibold">{goal.title}</span>
                          </div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-slate-600">
                              ₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                            </span>
                            <span className="text-[11px] font-semibold">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-${goal.color}-500 rounded-full`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
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

          {/* Dashboard */}
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

          {/* Budget */}
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

          {/* Goals */}
          {activeSection === "Goals" && (
            <section className="space-y-4">
              {/* Header with Add Goal button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Savings Goals</h2>
                  <p className="text-[11px] text-slate-400">Track your financial goals and progress</p>
                </div>
                <button
                  onClick={() => {
                    setEditingGoal(null);
                    setGoalTitle("");
                    setGoalTarget("");
                    setGoalDate("");
                    setGoalDescription("");
                    setGoalIcon("🎯");
                    setGoalColor("violet");
                    setShowGoalForm(!showGoalForm);
                  }}
                  className="px-4 py-2 rounded-full text-xs bg-violet-500 text-white font-medium hover:bg-violet-600"
                >
                  {showGoalForm ? "Cancel" : "+ New Goal"}
                </button>
              </div>

              {/* Goal Form */}
              {showGoalForm && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                  <h3 className="text-sm font-semibold">
                    {editingGoal ? "Edit Goal" : "Create New Goal"}
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Goal Title *</label>
                      <input
                        type="text"
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        placeholder="e.g., Emergency Fund"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-400"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Target Amount (₹) *</label>
                      <input
                        type="number"
                        value={goalTarget}
                        onChange={(e) => setGoalTarget(e.target.value)}
                        placeholder="50000"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-400"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Target Date</label>
                      <input
                        type="date"
                        value={goalDate}
                        onChange={(e) => setGoalDate(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-400"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Icon</label>
                      <div className="flex gap-2">
                        {["🎯", "💰", "🏠", "🚗", "✈️", "💍", "📱", "🎓"].map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setGoalIcon(icon)}
                            className={`w-10 h-10 rounded-xl border-2 text-lg ${
                              goalIcon === icon
                                ? "border-violet-500 bg-violet-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Color Theme</label>
                      <div className="flex gap-2">
                        {[
                          { name: "violet", color: "bg-violet-500" },
                          { name: "emerald", color: "bg-emerald-500" },
                          { name: "blue", color: "bg-blue-500" },
                          { name: "rose", color: "bg-rose-500" },
                          { name: "amber", color: "bg-amber-500" },
                        ].map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setGoalColor(c.name)}
                            className={`w-8 h-8 rounded-lg ${c.color} ${
                              goalColor === c.name ? "ring-2 ring-offset-2 ring-slate-400" : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="text-xs text-slate-600 mb-1 block">Description</label>
                      <textarea
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                        placeholder="Add a note about this goal..."
                        rows={3}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-400"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={saveGoal}
                      disabled={goalSaving || !goalTitle.trim() || !goalTarget}
                      className="px-4 py-2 rounded-full text-xs bg-violet-500 text-white font-medium hover:bg-violet-600 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {goalSaving ? "Saving..." : editingGoal ? "Update Goal" : "Create Goal"}
                    </button>
                    {editingGoal && (
                      <button
                        onClick={() => {
                          setShowGoalForm(false);
                          setEditingGoal(null);
                        }}
                        className="px-4 py-2 rounded-full text-xs border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Goals List */}
              {goalsLoading ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
                  <p className="text-xs text-slate-400">Loading goals...</p>
                </div>
              ) : goals.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-sm font-semibold mb-1">No goals yet</p>
                  <p className="text-xs text-slate-400 mb-4">Create your first savings goal to get started</p>
                  <button
                    onClick={() => setShowGoalForm(true)}
                    className="px-4 py-2 rounded-full text-xs bg-violet-500 text-white font-medium hover:bg-violet-600"
                  >
                    Create Goal
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {goals.map((goal) => {
                    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                    const remaining = goal.target_amount - goal.current_amount;
                    const daysRemaining = goal.target_date
                      ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;

                    return (
                      <div
                        key={goal.id}
                        className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl bg-${goal.color}-100 flex items-center justify-center text-2xl`}>
                              {goal.icon}
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold">{goal.title}</h3>
                              {goal.description && (
                                <p className="text-[11px] text-slate-500 mt-0.5">{goal.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => editGoal(goal)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-600">Progress</span>
                              <span className="text-xs font-semibold">{progress.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-${goal.color}-500 rounded-full transition-all`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="text-slate-400 mb-0.5">Saved</div>
                              <div className="font-semibold">₹{goal.current_amount.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-slate-400 mb-0.5">Target</div>
                              <div className="font-semibold">₹{goal.target_amount.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-slate-400 mb-0.5">Remaining</div>
                              <div className="font-semibold text-rose-600">₹{remaining.toLocaleString()}</div>
                            </div>
                            {daysRemaining !== null && (
                              <div>
                                <div className="text-slate-400 mb-0.5">Days Left</div>
                                <div className={`font-semibold ${daysRemaining < 0 ? "text-rose-600" : ""}`}>
                                  {daysRemaining < 0 ? "Overdue" : daysRemaining}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Money Coach */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4 text-sm mt-6">
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

          {/* Wallet */}
          {activeSection === "Wallet" && (
            <section className="bg-white rounded-3xl border border-slate-200 p-4 text-sm space-y-4">
              <p className="text-xs text-slate-400">Wallet feature coming soon.</p>
            </section>
          )}

          {/* Settings */}
          {activeSection === "Settings" && (
            <section className="bg-white rounded-3xl border border-slate-200 p-4 text-sm space-y-4">
              <p className="text-xs text-slate-400">Settings feature coming soon.</p>
            </section>
          )}
        </main>
              {/* Import Modal Overlay */}
      {showImportModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={resetImportModal}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h2 className="text-lg font-semibold">Import Bank Statement</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Upload CSV from HDFC, SBI, ICICI etc. We'll parse, categorise, and import.
                </p>
              </div>
              <button
                onClick={resetImportModal}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Upload Section */}
              <section className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Upload CSV File</p>
                    <p className="text-xs text-slate-500">
                      Export from your bank (CSV), then upload it here. We support common formats.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="px-4 py-2 rounded-full text-xs bg-violet-500 text-white font-medium hover:bg-violet-600 cursor-pointer">
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setImportFile(file);
                          setImportPreview(null);
                          setImported(null);
                          setImportError(null);
                        }}
                      />
                      {importFile ? "Change File" : "Choose File"}
                    </label>
                    {importFile && (
                      <div className="px-4 py-2 rounded-full text-xs bg-slate-200 text-slate-700">
                        {importFile.name}
                      </div>
                    )}
                  </div>
                  {importFile && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleImportPreview}
                        disabled={importLoading}
                        className="px-4 py-2 rounded-full text-xs bg-violet-500 text-white disabled:opacity-60 disabled:cursor-not-allowed hover:bg-violet-600"
                      >
                        {importLoading ? "Processing..." : "Preview Transactions"}
                      </button>
                      <button
                        onClick={handleImportSubmit}
                        disabled={!importPreview || importLoading}
                        className="px-4 py-2 rounded-full text-xs bg-emerald-500 text-white disabled:opacity-60 disabled:cursor-not-allowed hover:bg-emerald-600"
                      >
                        {importLoading ? "Importing..." : "Import All"}
                      </button>
                    </div>
                  )}
                </div>
                {importError && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <p className="text-xs text-rose-600">{importError}</p>
                  </div>
                )}
                {imported !== null && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-xs text-emerald-600">
                      ✅ Successfully imported {imported} transactions!
                    </p>
                  </div>
                )}
              </section>

                           {/* Preview Section */}
                           {importPreview !== null && importPreview.length > 0 && (
                <section className="bg-white rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold mb-2">
                    Preview ({importPreview.length} transactions)
                  </p>
                  <p className="text-[11px] text-slate-400 mb-3">
                    This is how we understood your bank statement. Categories are auto-detected
                    based on merchant/keywords.
                  </p>
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="min-w-full text-[11px] border-collapse">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr className="text-slate-500">
                          <th className="text-left px-3 py-2 border-b border-slate-200">Date</th>
                          <th className="text-left px-3 py-2 border-b border-slate-200">Description</th>
                          <th className="text-left px-3 py-2 border-b border-slate-200">Category</th>
                          <th className="text-left px-3 py-2 border-b border-slate-200">Type</th>
                          <th className="text-right px-3 py-2 border-b border-slate-200">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((t, idx) => (
                          <tr key={idx} className="border-b border-slate-100">
                            <td className="px-3 py-2 text-slate-600">{t.date}</td>
                            <td className="px-3 py-2 text-slate-700">{t.description}</td>
                            <td className="px-3 py-2 text-slate-500">{t.category}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] ${
                                  t.type === "income"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-rose-50 text-rose-600"
                                }`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-medium ${
                                t.type === "income" ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {importPreview !== null && importPreview.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-xs text-amber-700">
                    ⚠️ We couldn't detect any transactions in this CSV. Please check that
                    the file has columns like Date, Description and Debit/Credit or Amount.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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