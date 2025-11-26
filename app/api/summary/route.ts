import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
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
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error(error);
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

    const transactions = data || [];
    const now = new Date();
    const thisMonth = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    });

    const income = thisMonth
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = thisMonth
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const savings = income - expense;

    return NextResponse.json({
      month: "This month",
      totalBalance: savings,
      income,
      expense,
      currency: "INR",
      totalTransactions: transactions.length,
      incomeTransactions: transactions.filter((t) => t.type === "income").length,
      expenseTransactions: transactions.filter((t) => t.type === "expense").length,
    });
  } catch (e) {
    console.error(e);
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