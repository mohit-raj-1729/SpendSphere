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
You are a friendly money coach for a personal budgeting web app.
- Be short and clear.
- Use simple language.
- Give 2–3 bullet tips.
- Base your answer only on the question and generic budgeting logic (no made-up data).
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