import { NextResponse } from 'next/server';

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

export async function GET() {
  return NextResponse.json(mockSummary);
}