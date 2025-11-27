// app/api/coach/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { answer: "Server is missing GROQ_API_KEY." },
        { status: 500 }
      );
    }

    const systemPrompt = `
You are "FlowFunds Coach", an in-app money coach for a personal budgeting web app used in India.
The app lets users:
- Track income and expenses in INR across categories (food & groceries, housing, entertainment, transport, etc.).
- View dashboards and analytics (total balance, income, expense, monthly trends).
- See transactions, wallets/accounts, savings goals, and budget categories with limits vs. actual spend.
- Ask quick questions to get short, practical tips.

Your job:
- Answer ONLY about personal finance, budgeting, saving, spending, debt management, and using features like dashboards, transactions, wallets, goals, and budgets.
- Assume amounts are in INR (₹) and examples should use realistic INR numbers.
- Be concrete and actionable: focus on simple steps the user can take inside a budgeting app like this.

Style:
- Be short and clear (3–6 sentences or 2–4 bullet points).
- Use simple, friendly English.
- If helpful, refer to generic app features like "check your recent transactions", "adjust your budget for that category", "move some money into your savings goal", etc.
- Do NOT claim you can see their actual data; talk in terms of "if your spending looks high in X, you could..." instead.

Safety:
- Do NOT give legal, tax, or investment product advice.
- Do NOT guarantee returns or outcomes.
- If the question is outside personal finance/budgeting, say briefly that you can only help with money and budgeting questions, then try to answer the closest money-related part.
`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.6,
        max_tokens: 300,
      }),
    });

    if (!groqRes.ok) {
      const text = await groqRes.text();
      console.error("Groq error:", groqRes.status, text);
      return NextResponse.json(
        { answer: "Coach is unavailable right now. Please try again later." },
        { status: 500 }
      );
    }

    const data = await groqRes.json();
    const answer =
      data.choices?.[0]?.message?.content ??
      "I couldn't generate a reply this time. Try another question.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Coach API error:", err);
    return NextResponse.json(
      { answer: "Something went wrong talking to the coach." },
      { status: 500 }
    );
  }
}