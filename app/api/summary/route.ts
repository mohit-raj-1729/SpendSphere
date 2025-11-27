import { NextResponse } from "next/server";

// Define transaction type
type Transaction = {
  id?: string;
  date: string;
  description?: string;
  category?: string;
  type: "income" | "expense";
  amount: number | string;
  merchant?: string | null;
};

// Optional: Only import Supabase if you have the env vars
let supabaseClient: any = null;
try {
  const { createClient } = require("@supabase/supabase-js");
  // Use the same variable names as auth routes
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    supabaseClient = createClient(url, key);
  } else {
    console.error("Supabase not configured:", {
      hasUrl: !!url,
      hasKey: !!key,
    });
  }
} catch (e) {
  console.error("Failed to initialize Supabase:", e);
  // Supabase not available, will use fallback
}

export async function GET() {
  // If no Supabase, return default values
  if (!supabaseClient) {
    return NextResponse.json({
      month: "This month",
      totalBalance: 0,
      income: 0,
      expense: 0,
      currency: "INR",
      totalTransactions: 0,
      incomeTransactions: 0,
      expenseTransactions: 0,
    });
  }

  try {
    const { data, error } = await supabaseClient
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({
        month: "This month",
        totalBalance: 0,
        income: 0,
        expense: 0,
        currency: "INR",
        totalTransactions: 0,
        incomeTransactions: 0,
        expenseTransactions: 0,
      });
    }

    const transactions: Transaction[] = (data || []) as Transaction[];
    const now = new Date();
    const thisMonth = transactions.filter((t: Transaction) => {
      const txDate = new Date(t.date);
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    });

    const income = thisMonth
      .filter((t: Transaction) => t.type === "income")
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
    const expense = thisMonth
      .filter((t: Transaction) => t.type === "expense")
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
    const savings = income - expense;

    return NextResponse.json({
      month: "This month",
      totalBalance: savings,
      income,
      expense,
      currency: "INR",
      totalTransactions: transactions.length,
      incomeTransactions: transactions.filter((t: Transaction) => t.type === "income").length,
      expenseTransactions: transactions.filter((t: Transaction) => t.type === "expense").length,
    });
  } catch (e) {
    console.error("Summary API error:", e);
    return NextResponse.json({
      month: "This month",
      totalBalance: 0,
      income: 0,
      expense: 0,
      currency: "INR",
      totalTransactions: 0,
      incomeTransactions: 0,
      expenseTransactions: 0,
    });
  }
}