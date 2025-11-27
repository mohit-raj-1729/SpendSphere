"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<
    "Dashboard" | "Transactions" | "Wallet" | "Goals" | "Budget" | "Analytics" | "Settings"
  >("Dashboard");

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

  // Add state for month picker
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

  // Add state for profile dropdown
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Add state for settings
  const [currency, setCurrency] = useState("INR");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  const [notifications, setNotifications] = useState(true);
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [compactMode, setCompactMode] = useState(false);

  // Add state for Wallet
  type WalletAccount = {
    id: string;
    name: string;
    type: "Bank" | "Cash" | "Credit Card" | "Savings" | "Investment";
    balance: number;
    color: string;
  };

  const [walletAccounts, setWalletAccounts] = useState<WalletAccount[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<WalletAccount["type"]>("Bank");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null);
  const [tempBalanceValue, setTempBalanceValue] = useState("");

  // Add state for Goals
  type Goal = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    category: "Emergency" | "Vacation" | "House" | "Car" | "Education" | "Other";
    color: string;
  };

  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState<Goal["category"]>("Other");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Add state for pie chart hover
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);

  // Add state for category budgets
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [editingBudgetCategory, setEditingBudgetCategory] = useState<string | null>(null);
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [showBudgetManager, setShowBudgetManager] = useState(false);

  // Add state for CSV import
  const [showImportCard, setShowImportCard] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[] | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvImported, setCsvImported] = useState<number | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Add state for goal amount input
  const [goalAmountInputs, setGoalAmountInputs] = useState<Record<string, string>>({});

  // Add state for coach chat history
  const [coachChatHistory, setCoachChatHistory] = useState<Array<{question: string; answer: string}>>([]);

  // Suggested questions for the coach
  const suggestedQuestions = [
    "How can I save more money?",
    "What's the best way to create a budget?",
    "How much should I save each month?",
    "Should I pay off debt or save first?",
    "How can I reduce my expenses?",
    "What are good investment options for beginners?",
  ];

  useEffect(() => {
    // Load settings from localStorage
    const savedCurrency = localStorage.getItem("currency") || "INR";
    const savedAutoRefresh = localStorage.getItem("autoRefresh") !== "false";
    const savedRefreshInterval = parseInt(localStorage.getItem("refreshInterval") || "5");
    const savedNotifications = localStorage.getItem("notifications") !== "false";
    const savedDateFormat = localStorage.getItem("dateFormat") || "DD/MM/YYYY";
    const savedCompactMode = localStorage.getItem("compactMode") === "true";

    setCurrency(savedCurrency);
    setAutoRefresh(savedAutoRefresh);
    setRefreshInterval(savedRefreshInterval);
    setNotifications(savedNotifications);
    setDateFormat(savedDateFormat);
    setCompactMode(savedCompactMode);

    // Load user info from localStorage
    const email = localStorage.getItem("user_email");
    const userId = localStorage.getItem("user_id");
    setUserEmail(email);
    
    // Get initials from email or use default
    if (email) {
      const name = email.split("@")[0];
      setUserName(name);
    }
    
    void loadSummary();
    void loadTransactions();
    
    // Auto-refresh every X seconds (if enabled)
    let interval: NodeJS.Timeout | null = null;
    if (savedAutoRefresh) {
      interval = setInterval(() => {
        void loadSummary();
        void loadTransactions();
      }, savedRefreshInterval * 1000);
    }

    // Load category budgets from localStorage
    const savedBudgets = localStorage.getItem("categoryBudgets");
    if (savedBudgets) {
      setCategoryBudgets(JSON.parse(savedBudgets));
    }

    // Load wallet accounts from localStorage
    const savedAccounts = localStorage.getItem("walletAccounts");
    if (savedAccounts) {
      setWalletAccounts(JSON.parse(savedAccounts));
    }

    // Load goals from localStorage
    const savedGoals = localStorage.getItem("goals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Close month picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (showMonthPicker && !target.closest('.relative')) {
        setShowMonthPicker(false);
      }
    }
    
    if (showMonthPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMonthPicker]);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (showProfileMenu && !target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    }
    
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu]);

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

  // Add logout handler
  function handleLogout() {
    // Clear localStorage
    localStorage.removeItem("supabase_session");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    
    // Redirect to auth page
    router.push("/auth");
  }

  // Add help handler
  function handleHelp() {
    // You can customize this - show a modal, redirect to help page, or open a link
    const helpContent = `
SpendSphere Help Guide

📊 Dashboard: Overview of your finances
💳 Transactions: View and filter all transactions
👛 Wallet: Manage your accounts
🎯 Goals: Set and track savings goals
💰 Budget: Compare spending vs limits
📈 Analytics: Detailed financial insights
⚙️ Settings: Configure your preferences

Quick Tips:
• Import your bank CSV to get started
• Use the Money Coach for financial advice
• Set budgets to track spending
• Review Analytics for detailed insights

Need more help? Contact support at help@spendsphere.com
    `;
    
    alert(helpContent);
    // Alternative: router.push("/help");
    // Alternative: setShowHelpModal(true);
  }

  // Add month picker handler
  function handleMonthSelect(monthsAgo: number) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    setSelectedMonth(monthName);
    setShowMonthPicker(false);
    
    // You can update the summary to fetch data for selected month
    // For now, just update the display
    // In a real implementation, you'd call loadSummary() with month parameter
  }

  // Add profile menu handler
  function handleProfileClick() {
    setShowProfileMenu(!showProfileMenu);
  }

  // Handle currency change
  function handleCurrencyChange(newCurrency: string) {
    setCurrency(newCurrency);
    localStorage.setItem("currency", newCurrency);
  }

  // Handle auto-refresh toggle
  function handleAutoRefreshToggle(enabled: boolean) {
    setAutoRefresh(enabled);
    localStorage.setItem("autoRefresh", enabled.toString());
    // Restart interval if enabled
    if (enabled) {
      const interval = setInterval(() => {
        void loadSummary();
        void loadTransactions();
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }

  // Handle refresh interval change
  function handleRefreshIntervalChange(seconds: number) {
    setRefreshInterval(seconds);
    localStorage.setItem("refreshInterval", seconds.toString());
    // Restart interval with new value
    if (autoRefresh) {
      const interval = setInterval(() => {
        void loadSummary();
        void loadTransactions();
      }, seconds * 1000);
      return () => clearInterval(interval);
    }
  }

  // Handle notifications toggle
  function handleNotificationsToggle(enabled: boolean) {
    setNotifications(enabled);
    localStorage.setItem("notifications", enabled.toString());
  }

  // Handle date format change
  function handleDateFormatChange(format: string) {
    setDateFormat(format);
    localStorage.setItem("dateFormat", format);
  }

  // Handle compact mode toggle
  function handleCompactModeToggle(enabled: boolean) {
    setCompactMode(enabled);
    localStorage.setItem("compactMode", enabled.toString());
  }

  // Export data
  function handleExportData() {
    const data = {
      summary: summary,
      transactions: transactions,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spendsphere-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Get user initials for avatar
  function getUserInitials(): string {
    if (userEmail) {
      const parts = userEmail.split("@")[0].split(".");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return userEmail.substring(0, 2).toUpperCase();
    }
    return "AD"; // Default
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

  // Improved budget calculation - include user budgets even without current spending
  const budgetCategorySet = new Set([
    ...Object.keys(categoryTotals),
    ...Object.keys(categoryBudgets),
  ]);
  const budgetByCategory = Array.from(budgetCategorySet)
    .map((cat) => {
      const spent = categoryTotals[cat] || 0;
      const userBudget = categoryBudgets[cat];
      return {
        id: cat,
        name: cat,
        limit: userBudget || 0, // 0 means not set
        spent: Math.round(spent),
        hasBudget: !!userBudget,
      };
    })
    .filter((b) => b.hasBudget || b.spent > 0); // Show categories with budgets or spending

  const categoryListForBudgetManager = Array.from(
    new Set([...Object.keys(categoryTotals), ...Object.keys(categoryBudgets)])
  );

  // Wallet functions
  function handleAddAccount() {
    if (!newAccountName.trim() || !newAccountBalance.trim()) return;

    const balance = parseFloat(newAccountBalance) || 0;
    const colors = ["bg-violet-500", "bg-emerald-500", "bg-blue-500", "bg-rose-500", "bg-amber-500"];
    const color = colors[walletAccounts.length % colors.length];

    const newAccount: WalletAccount = {
      id: Date.now().toString(),
      name: newAccountName,
      type: newAccountType,
      balance: balance,
      color: color,
    };

    const updated = [...walletAccounts, newAccount];
    setWalletAccounts(updated);
    localStorage.setItem("walletAccounts", JSON.stringify(updated));
    
    setNewAccountName("");
    setNewAccountBalance("");
    setShowAddAccount(false);
  }

  function handleDeleteAccount(id: string) {
    const updated = walletAccounts.filter(acc => acc.id !== id);
    setWalletAccounts(updated);
    localStorage.setItem("walletAccounts", JSON.stringify(updated));
  }

  function handleUpdateAccountBalance(id: string, newBalance: number) {
    const updated = walletAccounts.map(acc =>
      acc.id === id ? { ...acc, balance: newBalance } : acc
    );
    setWalletAccounts(updated);
    localStorage.setItem("walletAccounts", JSON.stringify(updated));
  }

  const totalWalletBalance = walletAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Goals functions
  function handleAddGoal() {
    if (!newGoalName.trim() || !newGoalTarget.trim() || !newGoalDeadline.trim()) return;

    const target = parseFloat(newGoalTarget) || 0;
    const colors = ["bg-violet-500", "bg-emerald-500", "bg-blue-500", "bg-rose-500", "bg-amber-500", "bg-indigo-500"];
    const color = colors[goals.length % colors.length];

    const newGoal: Goal = {
      id: Date.now().toString(),
      name: newGoalName,
      targetAmount: target,
      currentAmount: 0,
      deadline: newGoalDeadline,
      category: newGoalCategory,
      color: color,
    };

    const updated = [...goals, newGoal];
    setGoals(updated);
    localStorage.setItem("goals", JSON.stringify(updated));
    
    setNewGoalName("");
    setNewGoalTarget("");
    setNewGoalDeadline("");
    setShowAddGoal(false);
  }

  function handleDeleteGoal(id: string) {
    const updated = goals.filter(goal => goal.id !== id);
    setGoals(updated);
    localStorage.setItem("goals", JSON.stringify(updated));
  }

  function handleUpdateGoalProgress(id: string, amount: number) {
    const updated = goals.map(goal => {
      if (goal.id === id) {
        const newAmount = Math.max(0, Math.min(goal.targetAmount, goal.currentAmount + amount));
        return { ...goal, currentAmount: newAmount };
      }
      return goal;
    });
    setGoals(updated);
    localStorage.setItem("goals", JSON.stringify(updated));
    // Clear input after update
    setGoalAmountInputs(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleAddToGoal(goalId: string) {
    const inputValue = goalAmountInputs[goalId] || "0";
    const amount = parseFloat(inputValue) || 0;
    if (amount > 0) {
      handleUpdateGoalProgress(goalId, amount);
    }
  }

  const totalGoalsProgress = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalGoalsTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);

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

  // Budget management functions
  function handleSetBudget(category: string, amount: number) {
    const updated = { ...categoryBudgets, [category]: amount };
    setCategoryBudgets(updated);
    localStorage.setItem("categoryBudgets", JSON.stringify(updated));
    setEditingBudgetCategory(null);
    setNewBudgetAmount("");
  }

  function handleDeleteBudget(category: string) {
    const updated = { ...categoryBudgets };
    delete updated[category];
    setCategoryBudgets(updated);
    localStorage.setItem("categoryBudgets", JSON.stringify(updated));
  }

  // CSV Import functions
  async function handleCsvPreview() {
    if (!csvFile) return;
    setCsvLoading(true);
    setCsvError(null);
    setCsvImported(null);

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("mode", "preview");

    try {
      const res = await fetch("/api/import-bank", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setCsvError("Failed to parse file. Please check CSV format.");
        setCsvLoading(false);
        return;
      }

      const data = await res.json();
      setCsvPreview(data.transactions || []);
    } catch (err) {
      setCsvError("Failed to process file.");
    } finally {
      setCsvLoading(false);
    }
  }

  async function handleCsvImport() {
    if (!csvFile || !csvPreview) return;
    
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setCsvError("Please log in to import transactions.");
      return;
    }

    setCsvLoading(true);
    setCsvError(null);

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("mode", "import");
    formData.append("user_id", userId);

    try {
      const res = await fetch("/api/import-bank", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setCsvError(data.error || "Import failed.");
        setCsvLoading(false);
        return;
      }

      setCsvImported(data.imported);
      setCsvLoading(false);
      
      // Refresh data
      void loadSummary();
      void loadTransactions();
      
      // Reset after 2 seconds
      setTimeout(() => {
        setShowImportCard(false);
        setCsvFile(null);
        setCsvPreview(null);
        setCsvImported(null);
      }, 2000);
    } catch (err) {
      setCsvError("Import failed.");
      setCsvLoading(false);
    }
  }

  function handleStartEditBalance(account: WalletAccount) {
    setEditingBalanceId(account.id);
    setTempBalanceValue(account.balance.toString());
  }

  function handleSaveBalance(id: string) {
    const newBalance = parseFloat(tempBalanceValue) || 0;
    handleUpdateAccountBalance(id, newBalance);
    setEditingBalanceId(null);
    setTempBalanceValue("");
  }

  function handleSuggestionClick(suggestion: string) {
    setCoachQuestion(suggestion);
    // Auto-focus the textarea
    setTimeout(() => {
      const textarea = document.getElementById('coach-textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-slate-200 border-r flex flex-col">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-slate-100">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative text-xs font-extrabold tracking-tighter">SS</span>
          </div>
          <div>
            <div className="text-sm font-semibold">SpendSphere</div>
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
          <button 
            onClick={handleHelp}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span>Help</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-20 px-8 border-b bg-white flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{headerTitleMap[activeSection]}</h1>
            <p className="text-xs text-slate-400">{headerSubMap[activeSection]}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowImportCard(!showImportCard)}
              className="px-3 py-1.5 rounded-full text-xs bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
            >
              Import CSV
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span>📅</span>
                <span>{selectedMonth}</span>
                <span className="text-[10px]">▼</span>
              </button>
              
              {/* Month Picker Dropdown */}
              {showMonthPicker && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => handleMonthSelect(0)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700"
                    >
                      This Month
                    </button>
                    <button
                      onClick={() => handleMonthSelect(1)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700"
                    >
                      Last Month
                    </button>
                    <button
                      onClick={() => handleMonthSelect(2)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700"
                    >
                      2 Months Ago
                    </button>
                    <button
                      onClick={() => handleMonthSelect(3)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700"
                    >
                      3 Months Ago
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => setShowMonthPicker(false)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
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
            
            {/* Profile Button with Dropdown */}
            <div className="relative profile-menu-container">
              <button
                onClick={handleProfileClick}
                className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors overflow-hidden flex items-center justify-center text-xs font-medium text-slate-700 cursor-pointer"
                title={userEmail || "Profile"}
              >
                {getUserInitials()}
              </button>
              
              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                  {/* User Info Section */}
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center text-white font-semibold text-sm">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {userName || "User"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {userEmail || "No email"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Options */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setActiveSection("Settings");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span>⚙️</span>
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSection("Dashboard");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span>📊</span>
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        handleHelp();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span>❓</span>
                      <span>Help & Support</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <span>🚪</span>
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Import CSV Card */}
          {showImportCard && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Import Bank CSV</h2>
                  <p className="text-[11px] text-slate-400">Upload your bank statement CSV file</p>
                </div>
                <button
                  onClick={() => {
                    setShowImportCard(false);
                    setCsvFile(null);
                    setCsvPreview(null);
                    setCsvError(null);
                    setCsvImported(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-lg"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        setCsvFile(e.target.files?.[0] || null);
                        setCsvPreview(null);
                        setCsvImported(null);
                        setCsvError(null);
                      }}
                      className="hidden"
                      id="csv-file-input"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => document.getElementById('csv-file-input')?.click()}
                        className="px-4 py-2 rounded-xl text-xs bg-violet-500 text-white hover:bg-violet-600 transition-colors font-medium"
                      >
                        📁 Choose CSV File
                      </button>
                      {csvFile && (
                        <span className="text-xs text-slate-600">{csvFile.name}</span>
                      )}
                    </div>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCsvPreview}
                    disabled={!csvFile || csvLoading}
                    className="px-4 py-2 rounded-xl text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition-colors"
                  >
                    {csvLoading ? "Processing..." : "Preview"}
                  </button>
                  <button
                    onClick={handleCsvImport}
                    disabled={!csvFile || !csvPreview || csvLoading}
                    className="px-4 py-2 rounded-xl text-xs bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                  >
                    Import All
                  </button>
                </div>

                {csvError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <p className="text-xs text-rose-600">{csvError}</p>
                  </div>
                )}

                {csvImported !== null && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-xs text-emerald-600">
                      ✅ Successfully imported {csvImported} transactions!
                    </p>
                  </div>
                )}

                {csvPreview && csvPreview.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs font-medium text-slate-700 mb-2">
                      Preview ({csvPreview.length} transactions found)
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {csvPreview.slice(0, 5).map((t: any, idx: number) => (
                        <div key={idx} className="text-[10px] text-slate-600 flex items-center justify-between p-1.5 bg-white rounded">
                          <span>{t.date} - {t.description}</span>
                          <span className={t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>
                            {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {csvPreview.length > 5 && (
                        <p className="text-[10px] text-slate-400 text-center mt-1">
                          ... and {csvPreview.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeSection === "Analytics" && (
            <>
              {summaryError && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-2xl mb-4">
                  {summaryError}
                </p>
              )}

              {/* Enhanced Top Stats Cards */}
              <section className="grid gap-4 md:grid-cols-4">
                <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-3xl border border-violet-400 p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <span className="text-lg">💰</span>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/20">
                      {s.totalTransactions} txn
                    </span>
                  </div>
                  <p className="text-[11px] text-violet-100 mb-1">Total Balance</p>
                  <p className="text-2xl font-bold mb-2">₹{s.totalBalance.toLocaleString()}</p>
                  <p className="text-[10px] text-violet-200">
                    {s.incomeTransactions} income / {s.expenseTransactions} expense
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl border border-emerald-400 p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <span className="text-lg">📈</span>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/20">
                      +{s.incomeTransactions}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100 mb-1">Total Income</p>
                  <p className="text-2xl font-bold mb-2">₹{s.income.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-200">
                    {s.incomeTransactions > 0 ? `Avg: ₹${Math.round(s.income / s.incomeTransactions).toLocaleString()}` : "No income"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl border border-rose-400 p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <span className="text-lg">📉</span>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/20">
                      -{s.expenseTransactions}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-100 mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold mb-2">₹{s.expense.toLocaleString()}</p>
                  <p className="text-[10px] text-rose-200">
                    {s.expenseTransactions > 0 ? `Avg: ₹${Math.round(s.expense / s.expenseTransactions).toLocaleString()}` : "No expenses"}
                  </p>
                </div>

                <div className={`bg-gradient-to-br ${(s.income - s.expense) >= 0 ? 'from-emerald-500 to-emerald-600 border-emerald-400' : 'from-rose-500 to-rose-600 border-rose-400'} rounded-3xl border p-5 text-white shadow-lg`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <span className="text-lg">⚖️</span>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full bg-white/20`}>
                      {s.income > 0 ? Math.round(((s.income - s.expense) / s.income) * 100) : 0}%
                    </span>
                  </div>
                  <p className="text-[11px] text-white/90 mb-1">Net Balance</p>
                  <p className="text-2xl font-bold mb-2">
                    {(s.income - s.expense) >= 0 ? '+' : ''}₹{(s.income - s.expense).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-white/80">
                    {s.income > 0 ? `${Math.round(((s.income - s.expense) / s.income) * 100)}% savings rate` : "No income"}
                  </p>
                </div>
              </section>

              {/* Income vs Expense Pie Chart */}
              <section className="grid gap-4 lg:grid-cols-2">
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Income vs Expenses</h2>
                      <p className="text-[11px] text-slate-400">{s.month}</p>
                    </div>
                  </div>
                  {s.income === 0 && s.expense === 0 ? (
                    <div className="h-48 flex items-center justify-center">
                      <p className="text-xs text-slate-400">No data to display</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <PieChart
                          data={[
                            {
                              label: 'Income',
                              value: s.income,
                              color: '#10b981', // emerald-500
                            },
                            {
                              label: 'Expenses',
                              value: s.expense,
                              color: '#ef4444', // rose-500
                            },
                          ]}
                          size={220}
                          strokeWidth={4}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            <p className="text-xs text-slate-400">Total</p>
                            <p className="text-lg font-bold text-slate-700">
                              ₹{(s.income + s.expense).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-xs text-slate-600">Income</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-emerald-600">₹{s.income.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500 ml-2">
                              ({s.income + s.expense > 0 ? Math.round((s.income / (s.income + s.expense)) * 100) : 0}%)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span className="text-xs text-slate-600">Expenses</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-rose-600">₹{s.expense.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500 ml-2">
                              ({s.income + s.expense > 0 ? Math.round((s.expense / (s.income + s.expense)) * 100) : 0}%)
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-600">Net Balance</span>
                            <span className={`text-sm font-bold ${(s.income - s.expense) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {(s.income - s.expense) >= 0 ? '+' : ''}₹{(s.income - s.expense).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Breakdown Pie Chart */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Spending by Category</h2>
                      <p className="text-[11px] text-slate-400">Top categories</p>
                    </div>
                  </div>
                  {Object.keys(categoryTotals).length === 0 ? (
                    <div className="h-48 flex items-center justify-center">
                      <p className="text-xs text-slate-400">No spending data</p>
                    </div>
                  ) : (
                    <CategoryPieChart categoryTotals={categoryTotals} totalExpense={s.expense} />
                  )}
                </div>
              </section>

              {/* Enhanced Budget Comparison */}
              <section className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Budget vs Actual Spending</h2>
                    <p className="text-[11px] text-slate-400">{s.month}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowBudgetManager(!showBudgetManager)}
                      className="px-3 py-1.5 rounded-full text-xs bg-violet-500 text-white hover:bg-violet-600 transition-colors"
                    >
                      {showBudgetManager ? "Cancel" : "⚙️ Manage Budgets"}
                    </button>
                    <div className="flex items-center gap-4 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                        <span className="text-slate-500">On Track</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-slate-500">Over Budget</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Manager */}
                {showBudgetManager && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-semibold mb-3 text-slate-900">Set Budgets for Categories</h3>
                    <div className="space-y-3">
                      {/* Set budget for existing categories */}
                      {categoryListForBudgetManager.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-600 font-medium">Current Spending Categories:</p>
                          {categoryListForBudgetManager.map((cat) => {
                            const currentBudget = categoryBudgets[cat];
                            const isEditing = editingBudgetCategory === cat;
                            return (
                              <div key={cat} className="flex items-center gap-2 p-2 bg-white rounded-xl">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-700 truncate">{cat}</p>
                                  {currentBudget && (
                                    <p className="text-[10px] text-slate-500">
                                      Current budget: ₹{currentBudget.toLocaleString()}
                                    </p>
                                  )}
                                </div>
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      placeholder="Amount"
                                      value={newBudgetAmount}
                                      onChange={(e) => setNewBudgetAmount(e.target.value)}
                                      className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                                    />
                                    <button
                                      onClick={() => {
                                        const amount = parseFloat(newBudgetAmount);
                                        if (amount > 0) {
                                          handleSetBudget(cat, amount);
                                        }
                                      }}
                                      className="px-2 py-1 rounded-lg text-xs bg-violet-500 text-white hover:bg-violet-600"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingBudgetCategory(null);
                                        setNewBudgetAmount("");
                                      }}
                                      className="px-2 py-1 rounded-lg text-xs bg-slate-200 text-slate-600 hover:bg-slate-300"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingBudgetCategory(cat);
                                        setNewBudgetAmount(currentBudget?.toString() || "");
                                      }}
                                      className="px-2 py-1 rounded-lg text-xs bg-violet-100 text-violet-600 hover:bg-violet-200"
                                    >
                                      {currentBudget ? "Edit" : "Set"}
                                    </button>
                                    {currentBudget && (
                                      <button
                                        onClick={() => handleDeleteBudget(cat)}
                                        className="px-2 py-1 rounded-lg text-xs bg-rose-100 text-rose-600 hover:bg-rose-200"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add budget for new category */}
                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-[11px] text-slate-600 font-medium mb-2">Add Budget for New Category:</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            id="newCategoryName"
                            placeholder="Category name"
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                          />
                          <input
                            type="number"
                            id="newCategoryBudget"
                            placeholder="Budget amount"
                            className="w-32 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                          />
                          <button
                            onClick={() => {
                              const categoryInput = document.getElementById('newCategoryName') as HTMLInputElement;
                              const amountInput = document.getElementById('newCategoryBudget') as HTMLInputElement;
                              const category = categoryInput?.value.trim();
                              const amount = parseFloat(amountInput?.value || '0');
                              if (category && amount > 0) {
                                handleSetBudget(category, amount);
                                if (categoryInput) categoryInput.value = '';
                                if (amountInput) amountInput.value = '';
                              }
                            }}
                            className="px-3 py-2 rounded-lg text-xs bg-violet-500 text-white hover:bg-violet-600"
                          >
                            Add
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Enter category name and budget amount, then click "Add"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Budget vs Spending Display */}
                {budgetByCategory.filter(b => b.hasBudget).length === 0 ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-2">No budgets set yet</p>
                      <button
                        onClick={() => setShowBudgetManager(true)}
                        className="text-xs text-violet-500 hover:text-violet-600 font-medium hover:underline"
                      >
                        Click here to set budgets for your categories
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {budgetByCategory
                      .filter(b => b.hasBudget)
                      .map((b) => {
                        const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
                        const isOverBudget = pct > 100;
                        const remaining = b.limit - b.spent;
                        return (
                          <div key={b.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold text-slate-700">{b.name}</span>
                                  {isOverBudget && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-medium">
                                      Over Budget
                                    </span>
                                  )}
                                  {!isOverBudget && pct > 80 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
                                      Near Limit
                                    </span>
                                  )}
                                  <button
                                    onClick={() => {
                                      setEditingBudgetCategory(b.name);
                                      setNewBudgetAmount(b.limit.toString());
                                    }}
                                    className="text-[10px] text-violet-500 hover:text-violet-600"
                                  >
                                    Edit
                                  </button>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                  <span>Spent: ₹{b.spent.toLocaleString()}</span>
                                  <span>•</span>
                                  <span>Budget: ₹{b.limit.toLocaleString()}</span>
                                  {remaining > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-emerald-600">Remaining: ₹{remaining.toLocaleString()}</span>
                                    </>
                                  )}
                                  {remaining < 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-rose-600">Over by: ₹{Math.abs(remaining).toLocaleString()}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-bold ${isOverBudget ? 'text-rose-600' : pct > 80 ? 'text-amber-600' : 'text-violet-600'}`}>
                                  {pct}%
                                </p>
                                <p className="text-[10px] text-slate-400">used</p>
                              </div>
                            </div>
                            <div className="h-3 rounded-full bg-slate-100 overflow-hidden relative">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isOverBudget 
                                    ? "bg-gradient-to-r from-rose-400 to-rose-500" 
                                    : pct > 80
                                    ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                    : "bg-gradient-to-r from-violet-400 to-violet-500"
                                }`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                              {isOverBudget && (
                                <div className="absolute inset-0 border-2 border-rose-600 rounded-full" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </section>

              {/* Transaction Insights */}
              <section className="grid gap-4 md:grid-cols-3">
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <span className="text-lg">📊</span>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900">Transaction Count</h3>
                      <p className="text-[10px] text-slate-400">Total activity</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-1">{s.totalTransactions}</p>
                  <p className="text-[10px] text-slate-500">
                    {s.incomeTransactions} income + {s.expenseTransactions} expense
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <span className="text-lg">💵</span>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900">Avg. Income</h3>
                      <p className="text-[10px] text-slate-400">Per transaction</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-1">
                    ₹{s.incomeTransactions > 0 ? Math.round(s.income / s.incomeTransactions).toLocaleString() : '0'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {s.incomeTransactions} transactions
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                      <span className="text-lg">💸</span>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900">Avg. Expense</h3>
                      <p className="text-[10px] text-slate-400">Per transaction</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-1">
                    ₹{s.expenseTransactions > 0 ? Math.round(s.expense / s.expenseTransactions).toLocaleString() : '0'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {s.expenseTransactions} transactions
                  </p>
                </div>
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

          {/* Dashboard */}
          {activeSection === "Dashboard" && (
            <section className="space-y-4">
              {/* Enhanced Summary Cards with Gradients */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700 rounded-3xl border border-violet-400 p-5 text-white shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                      {s.totalTransactions} txn
                    </span>
                  </div>
                  <p className="text-[11px] text-violet-100 mb-1">Total Balance</p>
                  <p className="text-3xl font-bold mb-2">₹{s.totalBalance.toLocaleString()}</p>
                  <p className="text-[10px] text-violet-200">
                    {s.incomeTransactions} income • {s.expenseTransactions} expense
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl border border-emerald-400 p-5 text-white shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                      +{s.incomeTransactions}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100 mb-1">Total Income</p>
                  <p className="text-3xl font-bold mb-2">₹{s.income.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-200">
                    {s.incomeTransactions > 0 ? `Avg: ₹${Math.round(s.income / s.incomeTransactions).toLocaleString()}` : "No income yet"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 rounded-3xl border border-rose-400 p-5 text-white shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-2xl">📉</span>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                      -{s.expenseTransactions}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-100 mb-1">Total Expenses</p>
                  <p className="text-3xl font-bold mb-2">₹{s.expense.toLocaleString()}</p>
                  <p className="text-[10px] text-rose-200">
                    {s.expenseTransactions > 0 ? `Avg: ₹${Math.round(s.expense / s.expenseTransactions).toLocaleString()}` : "No expenses yet"}
                  </p>
                </div>
              </div>

              {/* Enhanced Quick Stats Row */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <span className="text-sm">⚖️</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">Net Flow</p>
                  </div>
                  <p className={`text-2xl font-bold ${(s.income - s.expense) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {(s.income - s.expense) >= 0 ? '+' : ''}₹{(s.income - s.expense).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                      <span className="text-sm">📅</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">Avg. Daily</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-700">
                    ₹{s.expenseTransactions > 0 ? Math.round(s.expense / 30).toLocaleString() : '0'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                      <span className="text-sm">🏆</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">Top Category</p>
                  </div>
                  <p className="text-lg font-bold text-slate-700 truncate">
                    {Object.keys(categoryTotals).length > 0 
                      ? Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0][0]
                      : 'N/A'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                      <span className="text-sm">💎</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">Savings Rate</p>
                  </div>
                  <p className={`text-2xl font-bold ${s.income > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {s.income > 0 ? Math.round(((s.income - s.expense) / s.income) * 100) : 0}%
                  </p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
                {/* Enhanced Recent Transactions */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Recent Transactions</h2>
                      <p className="text-[11px] text-slate-400">Latest activity</p>
                    </div>
                    <button
                      onClick={() => setActiveSection("Transactions")}
                      className="px-3 py-1.5 rounded-full text-xs bg-violet-50 text-violet-600 hover:bg-violet-100 font-medium transition-colors"
                    >
                      View all →
                    </button>
                  </div>
                  {transactionsLoading ? (
                    <div className="py-12 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mb-2"></div>
                      <p className="text-xs text-slate-400">Loading transactions...</p>
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">📄</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">No transactions yet.</p>
                      <a href="/import" className="text-xs text-violet-500 hover:text-violet-600 font-medium hover:underline">
                        Import your bank CSV to get started
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTransactions.slice(0, 5).map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                              t.type === 'income' 
                                ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white' 
                                : 'bg-gradient-to-br from-rose-400 to-rose-500 text-white'
                            }`}>
                              {t.type === 'income' ? '↑' : '↓'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-700 truncate">{t.description}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {t.category}
                                </span>
                                <span className="text-[10px] text-slate-400">{t.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className={`text-sm font-bold ${
                            t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enhanced Quick Actions & Insights */}
                <div className="space-y-4">
                  {/* Quick Actions with Icons */}
                  <div className="bg-gradient-to-br from-violet-50 to-white rounded-3xl border border-violet-100 p-5 shadow-sm">
                    <h2 className="text-sm font-semibold mb-4 text-slate-900 flex items-center gap-2">
                      <span>⚡</span>
                      <span>Quick Actions</span>
                    </h2>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveSection("Transactions")}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center transition-colors">
                            <span className="text-sm">💳</span>
                          </div>
                          <span className="text-xs font-medium text-slate-700">View All Transactions</span>
                        </div>
                        <span className="text-slate-400 group-hover:text-violet-500 transition-colors">→</span>
                      </button>
                      <a
                        href="/import"
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left group block"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
                            <span className="text-sm">📥</span>
                          </div>
                          <span className="text-xs font-medium text-slate-700">Import Bank CSV</span>
                        </div>
                        <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">→</span>
                      </a>
                      <button
                        onClick={() => setActiveSection("Budget")}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                            <span className="text-sm">💰</span>
                          </div>
                          <span className="text-xs font-medium text-slate-700">Manage Budget</span>
                        </div>
                        <span className="text-slate-400 group-hover:text-blue-500 transition-colors">→</span>
                      </button>
                      <button
                        onClick={() => setActiveSection("Goals")}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
                            <span className="text-sm">🎯</span>
                          </div>
                          <span className="text-xs font-medium text-slate-700">Ask Money Coach</span>
                        </div>
                        <span className="text-slate-400 group-hover:text-amber-500 transition-colors">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Top Spending Categories */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                    <h2 className="text-sm font-semibold mb-4 text-slate-900 flex items-center gap-2">
                      <span>📊</span>
                      <span>Top Spending Categories</span>
                    </h2>
                    {Object.keys(categoryTotals).length === 0 ? (
                      <div className="py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                          <span className="text-lg">📈</span>
                        </div>
                        <p className="text-xs text-slate-400">No spending data yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(categoryTotals)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([cat, amt], index) => {
                            const pct = s.expense > 0 ? Math.round((amt / s.expense) * 100) : 0;
                            const colors = [
                              "bg-violet-500", "bg-emerald-500", "bg-blue-500", 
                              "bg-rose-500", "bg-amber-500"
                            ];
                            const color = colors[index % colors.length];
                            return (
                              <div key={cat} className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                                    <span className="text-slate-700 font-medium">{cat}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500">{pct}%</span>
                                    <span className="text-slate-700 font-semibold">₹{amt.toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className={`h-full ${color} rounded-full transition-all`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Monthly Overview */}
              <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-3xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <span>📅</span>
                      <span>Monthly Overview</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-1">{s.month}</p>
                  </div>
                  <button
                    onClick={() => setActiveSection("Analytics")}
                    className="px-3 py-1.5 rounded-full text-xs bg-violet-50 text-violet-600 hover:bg-violet-100 font-medium transition-colors"
                  >
                    View Analytics →
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3 p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-600 font-medium">Income</span>
                      </div>
                      <span className="text-emerald-600 font-bold">₹{s.income.toLocaleString()}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                        style={{ 
                          width: `${s.income + s.expense > 0 ? Math.min(100, (s.income / (s.income + s.expense)) * 100) : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3 p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className="text-slate-600 font-medium">Expenses</span>
                      </div>
                      <span className="text-rose-600 font-bold">₹{s.expense.toLocaleString()}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all"
                        style={{ 
                          width: `${s.income + s.expense > 0 ? Math.min(100, (s.expense / (s.income + s.expense)) * 100) : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                {s.income > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${(s.income - s.expense) >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-xs text-slate-600 font-medium">Remaining Balance</span>
                      </div>
                      <span className={`text-lg font-bold ${(s.income - s.expense) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {(s.income - s.expense) >= 0 ? '+' : ''}₹{(s.income - s.expense).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
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
              {/* Goals Overview */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Savings Goals</h2>
                    <p className="text-[11px] text-slate-400">Track your progress</p>
                  </div>
                  <button
                    onClick={() => setShowAddGoal(!showAddGoal)}
                    className="px-3 py-1.5 rounded-full text-xs bg-violet-500 text-white hover:bg-violet-600 transition-colors"
                  >
                    {showAddGoal ? "Cancel" : "+ New Goal"}
                  </button>
                </div>

                {/* Overall Progress */}
                {goals.length > 0 && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-600">Total Progress</span>
                      <span className="text-xs font-semibold text-slate-700">
                        ₹{totalGoalsProgress.toLocaleString()} / ₹{totalGoalsTarget.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all"
                        style={{ width: `${totalGoalsTarget > 0 ? (totalGoalsProgress / totalGoalsTarget) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {totalGoalsTarget > 0 ? Math.round((totalGoalsProgress / totalGoalsTarget) * 100) : 0}% complete
                    </p>
                  </div>
                )}
              </div>

              {/* Add Goal Form */}
              {showAddGoal && (
                <div className="bg-white rounded-3xl border border-slate-200 p-4">
                  <h3 className="text-xs font-semibold mb-3 text-slate-900">Create New Goal</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Goal name (e.g., Vacation to Europe)"
                      value={newGoalName}
                      onChange={(e) => setNewGoalName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Target amount"
                        value={newGoalTarget}
                        onChange={(e) => setNewGoalTarget(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                      />
                      <input
                        type="date"
                        value={newGoalDeadline}
                        onChange={(e) => setNewGoalDeadline(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                      />
                    </div>
                    <select
                      value={newGoalCategory}
                      onChange={(e) => setNewGoalCategory(e.target.value as Goal["category"])}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                    >
                      <option value="Emergency">Emergency Fund</option>
                      <option value="Vacation">Vacation</option>
                      <option value="House">House</option>
                      <option value="Car">Car</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                    <button
                      onClick={handleAddGoal}
                      disabled={!newGoalName.trim() || !newGoalTarget.trim() || !newGoalDeadline.trim()}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Goal
                    </button>
                  </div>
                </div>
              )}

              {/* Goals List */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4">
                {goals.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    <p>No goals yet. Create your first savings goal!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goals.map((goal) => {
                      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                      const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      const isOverdue = daysRemaining < 0;
                      const isCompleted = goal.currentAmount >= goal.targetAmount;

                      return (
                        <div
                          key={goal.id}
                          className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-3 h-3 rounded-full ${goal.color}`} />
                                <h3 className="text-xs font-semibold text-slate-700">{goal.name}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                  {goal.category}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                {isOverdue && <span className="text-rose-500 ml-1">(Overdue)</span>}
                                {!isOverdue && <span className="text-slate-500 ml-1">({daysRemaining} days left)</span>}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="px-2 py-1 rounded-lg text-[10px] text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-600">
                                ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                              </span>
                              <span className={`text-xs font-semibold ${isCompleted ? 'text-emerald-600' : 'text-slate-700'}`}>
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isCompleted ? 'bg-emerald-500' : goal.color
                                }`}
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Add amount"
                              value={goalAmountInputs[goal.id] || ""}
                              onChange={(e) => {
                                setGoalAmountInputs(prev => ({
                                  ...prev,
                                  [goal.id]: e.target.value
                                }));
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddToGoal(goal.id);
                                }
                              }}
                              className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-[10px] focus:outline-none focus:ring-1 focus:ring-violet-400"
                            />
                            <button
                              onClick={() => handleAddToGoal(goal.id)}
                              disabled={!goalAmountInputs[goal.id] || parseFloat(goalAmountInputs[goal.id] || "0") <= 0}
                              className="px-3 py-1.5 rounded-lg text-[10px] bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                const remaining = goal.targetAmount - goal.currentAmount;
                                if (remaining > 0) {
                                  handleUpdateGoalProgress(goal.id, remaining);
                                }
                              }}
                              disabled={isCompleted}
                              className="px-2 py-1.5 rounded-lg text-[10px] bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Money Coach Section */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4 text-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    💬
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Ask the money coach</h2>
                    <p className="text-[11px] text-slate-400">Get personalized financial advice</p>
                  </div>
                </div>

                {/* Suggested Questions */}
                <div className="mb-3">
                  <p className="text-[10px] text-slate-500 mb-2 font-medium">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={coachLoading}
                        className="px-3 py-1.5 rounded-full text-[10px] bg-violet-50 text-violet-600 hover:bg-violet-100 hover:text-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-violet-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat History */}
                {coachChatHistory.length > 0 && (
                  <div className="mb-3 max-h-64 overflow-y-auto space-y-2">
                    {coachChatHistory.map((chat, index) => (
                      <div key={index} className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px]">👤</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-600 bg-slate-50 rounded-xl px-2 py-1.5">
                              {chat.question}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px]">💬</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-700 bg-violet-50 rounded-xl px-2 py-1.5 whitespace-pre-line">
                              {chat.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <div className="relative">
                  <textarea
                    id="coach-textarea"
                    className="w-full text-xs border border-slate-200 rounded-2xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all resize-none"
                    rows={3}
                    value={coachQuestion}
                    onChange={(e) => setCoachQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (coachQuestion.trim() && !coachLoading) {
                          handleCoachAsk();
                        }
                      }
                    }}
                    placeholder="Type your question here... (Press Enter to send)"
                    disabled={coachLoading}
                  />
                  <button
                    onClick={handleCoachAsk}
                    disabled={coachLoading || !coachQuestion.trim()}
                    className="absolute right-2 bottom-2 px-3 py-1.5 rounded-xl text-[10px] bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {coachLoading ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Asking...
                      </span>
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>

                {/* Error Message */}
                {coachError && (
                  <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200">
                    <p className="text-[10px] text-rose-600">{coachError}</p>
                  </div>
                )}

                {/* Current Answer (if not in history yet) */}
                {coachAnswer && coachChatHistory.length === 0 && (
                  <div className="mt-3 p-3 bg-violet-50 border border-violet-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px]">💬</span>
                      </div>
                      <p className="text-[11px] text-slate-700 whitespace-pre-line flex-1">
                        {coachAnswer}
                      </p>
                    </div>
                  </div>
                )}

                {/* Clear History Button */}
                {coachChatHistory.length > 0 && (
                  <button
                    onClick={() => {
                      setCoachChatHistory([]);
                      setCoachAnswer("");
                      setCoachQuestion("");
                    }}
                    className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Clear chat history
                  </button>
                )}
              </div>
            </section>
          )}

          {activeSection === "Wallet" && (
            <section className="space-y-4">
              {/* Total Balance Overview */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Total Balance</h2>
                    <p className="text-[11px] text-slate-400">Across all accounts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      ₹{totalWalletBalance.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {walletAccounts.length} {walletAccounts.length === 1 ? 'account' : 'accounts'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Accounts List */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-900">Accounts</h2>
                  <button
                    onClick={() => setShowAddAccount(!showAddAccount)}
                    className="px-3 py-1.5 rounded-full text-xs bg-violet-500 text-white hover:bg-violet-600 transition-colors"
                  >
                    {showAddAccount ? "Cancel" : "+ Add Account"}
                  </button>
                </div>

                {/* Add Account Form */}
                {showAddAccount && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-2xl space-y-2">
                    <input
                      type="text"
                      placeholder="Account name"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newAccountType}
                        onChange={(e) => setNewAccountType(e.target.value as WalletAccount["type"])}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                      >
                        <option value="Bank">Bank</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Savings">Savings</option>
                        <option value="Investment">Investment</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Balance"
                        value={newAccountBalance}
                        onChange={(e) => setNewAccountBalance(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                      />
                    </div>
                    <button
                      onClick={handleAddAccount}
                      disabled={!newAccountName.trim() || !newAccountBalance.trim()}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Account
                    </button>
                  </div>
                )}

                {/* Accounts List */}
                {walletAccounts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    <p>No accounts yet. Add your first account to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {walletAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-xl ${account.color} flex items-center justify-center text-white text-xs font-bold`}>
                            {account.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700">{account.name}</p>
                            <p className="text-[10px] text-slate-400">{account.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            {editingBalanceId === account.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={tempBalanceValue}
                                  onChange={(e) => setTempBalanceValue(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveBalance(account.id);
                                    }
                                  }}
                                  className="w-24 px-2 py-1 rounded-lg border border-violet-300 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveBalance(account.id)}
                                  className="px-2 py-1 rounded-lg text-[10px] bg-violet-500 text-white hover:bg-violet-600"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingBalanceId(null);
                                    setTempBalanceValue("");
                                  }}
                                  className="px-2 py-1 rounded-lg text-[10px] bg-slate-200 text-slate-600 hover:bg-slate-300"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs font-semibold text-slate-700">
                                  ₹{account.balance.toLocaleString()}
                                </p>
                                <button
                                  onClick={() => handleStartEditBalance(account)}
                                  className="text-[10px] text-violet-500 hover:text-violet-600 mt-0.5"
                                >
                                  Update
                                </button>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteAccount(account.id)}
                            className="px-2 py-1 rounded-lg text-xs text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Summary by Type */}
              {walletAccounts.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-4">
                  <h2 className="text-sm font-semibold mb-4 text-slate-900">Summary by Type</h2>
                  <div className="space-y-2">
                    {["Bank", "Cash", "Credit Card", "Savings", "Investment"].map((type) => {
                      const accountsOfType = walletAccounts.filter(acc => acc.type === type);
                      const total = accountsOfType.reduce((sum, acc) => sum + acc.balance, 0);
                      if (accountsOfType.length === 0) return null;
                      return (
                        <div key={type} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{accountsOfType.length} accounts</span>
                            <span className="font-semibold text-slate-700">₹{total.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSection === "Settings" && (
            <section className="space-y-4">
              {/* Appearance Settings */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4">
                <h2 className="text-sm font-semibold mb-4 text-slate-900">Appearance</h2>
                <div className="space-y-4">
                  {/* Compact Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-700">Compact Mode</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Reduce spacing for more content
                      </p>
                    </div>
                    <button
                      onClick={() => handleCompactModeToggle(!compactMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        compactMode ? "bg-violet-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          compactMode ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* General Settings */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4">
                <h2 className="text-sm font-semibold mb-4 text-slate-900">General</h2>
                <div className="space-y-4">
                  {/* Currency Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                      <option value="INR">₹ INR (Indian Rupee)</option>
                      <option value="USD">$ USD (US Dollar)</option>
                      <option value="EUR">€ EUR (Euro)</option>
                      <option value="GBP">£ GBP (British Pound)</option>
                      <option value="JPY">¥ JPY (Japanese Yen)</option>
                      <option value="CAD">$ CAD (Canadian Dollar)</option>
                      <option value="AUD">$ AUD (Australian Dollar)</option>
                    </select>
                  </div>

                  {/* Date Format */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Date Format
                    </label>
                    <select
                      value={dateFormat}
                      onChange={(e) => handleDateFormatChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD MMM YYYY">DD MMM YYYY</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data & Sync Settings */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4">
                <h2 className="text-sm font-semibold mb-4 text-slate-900">Data & Sync</h2>
                <div className="space-y-4">
                  {/* Auto Refresh Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-700">Auto Refresh</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Automatically update data periodically
                      </p>
                    </div>
                    <button
                      onClick={() => handleAutoRefreshToggle(!autoRefresh)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoRefresh ? "bg-violet-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoRefresh ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Refresh Interval */}
                  {autoRefresh && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        Refresh Interval: {refreshInterval} seconds
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="300"
                        step="5"
                        value={refreshInterval}
                        onChange={(e) => handleRefreshIntervalChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>5s</span>
                        <span>300s</span>
                      </div>
                    </div>
                  )}

                  {/* Export Data */}
                  <div>
                    <button
                      onClick={handleExportData}
                      className="w-full px-4 py-2 rounded-xl bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      📥 Export Data (JSON)
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4">
                <h2 className="text-sm font-semibold mb-4 text-slate-900">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-700">Enable Notifications</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Receive alerts for budget limits and goals
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationsToggle(!notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications ? "bg-violet-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-3xl border border-slate-200 p-4">
                <h2 className="text-sm font-semibold mb-4 text-slate-900">Account</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] text-slate-400 mb-1">Email</p>
                    <p className="text-xs text-slate-700">{userEmail || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 mb-1">User ID</p>
                    <p className="text-xs text-slate-700 font-mono">
                      {localStorage.getItem("user_id") || "Not available"}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 rounded-xl bg-rose-50 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      🚪 Log Out
                    </button>
                  </div>
                </div>
              </div>
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

// Add this component before the main AppDashboard component or at the end of the file

// Interactive Pie Chart Component
function PieChart({
  data,
  size = 200,
  strokeWidth = 2,
  onSegmentHover,
  hoveredIndex,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  strokeWidth?: number;
  onSegmentHover?: (index: number | null) => void;
  hoveredIndex?: number | null;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  let currentAngle = -90; // Start from top

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <p className="text-xs text-slate-400">No data</p>
      </div>
    );
  }

  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    const isHovered = hoveredIndex === index;

    return (
      <path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="white"
        strokeWidth={strokeWidth}
        className="transition-all cursor-pointer"
        style={{
          opacity: isHovered ? 1 : hoveredIndex !== null && hoveredIndex !== index ? 0.4 : 1,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          transformOrigin: `${center}px ${center}px`,
        }}
        onMouseEnter={() => onSegmentHover?.(index)}
        onMouseLeave={() => onSegmentHover?.(null)}
      />
    );
  });

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {segments}
    </svg>
  );
}

// Add this component for Category Pie Chart with hover state
function CategoryPieChart({
  categoryTotals,
  totalExpense,
}: {
  categoryTotals: Record<string, number>;
  totalExpense: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const colors = [
    '#8b5cf6', // violet-500
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#ef4444', // rose-500
    '#f59e0b', // amber-500
    '#6366f1', // indigo-500
  ];

  const chartData = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([cat, amt], index) => ({
      label: cat,
      value: amt,
      color: colors[index % colors.length],
    }));

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <PieChart
          data={chartData}
          size={220}
          strokeWidth={4}
          onSegmentHover={setHoveredIndex}
          hoveredIndex={hoveredIndex}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-lg font-bold text-slate-700">
              ₹{totalExpense.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full space-y-2 max-h-64 overflow-y-auto">
        {chartData.map((item, index) => {
          const pct = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                isHovered ? 'bg-slate-100 scale-105' : 'hover:bg-slate-50'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-700 truncate font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">{pct}%</span>
                <span className="text-xs font-semibold text-slate-700 min-w-[70px] text-right">
                  ₹{item.value.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}