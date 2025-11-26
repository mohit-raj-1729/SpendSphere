import { NextResponse } from 'next/server';
import { getTransactions, addTransaction } from '../../../lib/data';

export async function GET() {
  const transactions = await getTransactions();
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const newTransaction = await request.json();
  const addedTransaction = await addTransaction(newTransaction);
  return NextResponse.json(addedTransaction, { status: 201 });
}