import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ParsedTx = {
  date: string; // ISO
  description: string;
  merchant: string | null;
  amount: number;
  type: "income" | "expense";
  category: string;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const mode = (formData.get("mode") as string) || "preview"; // "preview" | "import"
    const userId = formData.get("user_id") as string; // Get user_id from form data

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const parsed = parseCsvToTransactions(text);

    // PREVIEW: no Supabase needed
    if (mode === "preview") {
      return NextResponse.json({ transactions: parsed });
    }

    // IMPORT: only run if Supabase is configured
    // Use the same variable names as other routes
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      console.error("Supabase not configured:", { hasUrl: !!url, hasKey: !!key });
      return NextResponse.json(
        { error: "Supabase is not configured on the server." },
        { status: 500 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required for importing transactions." },
        { status: 400 }
      );
    }

    const supabase = createClient(url, key);

    const { error } = await supabase.from("transactions").insert(
      parsed.map((t) => ({
        user_id: userId, // Link transactions to user
        date: t.date,
        description: t.description,
        merchant: t.merchant,
        amount: t.amount,
        type: t.type,
        category: t.category,
        source: "bank_csv",
        raw: t,
      }))
    );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: `Failed to import: ${error.message || JSON.stringify(error)}`}, 
        { status: 500 }
      );
    }

    return NextResponse.json({ imported: parsed.length });
  } catch (e) {
    console.error("import-bank error", e);
    return NextResponse.json(
      { error: "Unexpected error while parsing/importing CSV." },
      { status: 500 }
    );
  }
}

// --- parsing helpers ---

function parseCsvToTransactions(csv: string): ParsedTx[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const dateIdx = header.findIndex((h) => h.includes("date"));
  const descIdx =
    header.findIndex((h) => h.includes("description")) ??
    header.findIndex((h) => h.includes("narration"));
  const debitIdx = header.findIndex((h) => h.includes("debit"));
  const creditIdx = header.findIndex((h) => h.includes("credit"));
  const amountIdx =
    debitIdx === -1 && creditIdx === -1
      ? header.findIndex((h) => h.includes("amount"))
      : -1;

  const rows = lines.slice(1);
  const result: ParsedTx[] = [];

  for (const raw of rows) {
    const cols = raw.split(",");
    if (cols.length < 3) continue;

    const rawDate = cols[dateIdx]?.trim();
    const description = cols[descIdx]?.trim() || "Transaction";
    const debit = debitIdx >= 0 ? parseFloat(cols[debitIdx] || "0") : 0;
    const credit = creditIdx >= 0 ? parseFloat(cols[creditIdx] || "0") : 0;
    const amountCol = amountIdx >= 0 ? parseFloat(cols[amountIdx] || "0") : 0;

    let amount = 0;
    let type: "income" | "expense" = "expense";

    if (debitIdx >= 0 || creditIdx >= 0) {
      if (credit > 0) {
        amount = credit;
        type = "income";
      } else if (debit > 0) {
        amount = debit;
        type = "expense";
      } else {
        continue;
      }
    } else {
      amount = Math.abs(amountCol);
      type = amountCol >= 0 ? "income" : "expense";
    }

    const category = autoCategorize(description);
    const merchant = extractMerchant(description);
    const isoDate = normaliseDate(rawDate);

    result.push({ date: isoDate, description, merchant, amount, type, category });
  }

  return result;
}

function autoCategorize(description: string): string {
  const d = description.toLowerCase();
  if (d.includes("zomato") || d.includes("swiggy") || d.includes("restaurant"))
    return "Food & Restaurants";
  if (d.includes("uber") || d.includes("ola") || d.includes("cab"))
    return "Transport";
  if (d.includes("rent")) return "Rent";
  if (d.includes("salary") || d.includes("credit from employer")) return "Salary";
  if (d.includes("amazon") || d.includes("flipkart") || d.includes("myntra"))
    return "Shopping";
  if (d.includes("netflix") || d.includes("spotify") || d.includes("subscription"))
    return "Subscriptions";
  return "Others";
}

function extractMerchant(description: string): string | null {
  const token = description.split(" ")[0];
  return token || null;
}

function normaliseDate(raw: string): string {
    if (!raw) return new Date().toISOString().slice(0, 10);
    
    // Remove quotes and whitespace
    let cleaned = raw.trim().replace(/['"]/g, "");
    
    // Handle DD/MM/YYYY or DD-MM-YYYY
    if (cleaned.includes("/") || cleaned.includes("-")) {
      const separator = cleaned.includes("/") ? "/" : "-";
      const parts = cleaned.split(separator);
      
      if (parts.length === 3) {
        let [d, m, y] = parts.map((p) => p.trim());
        
        // If year is 2 digits, assume 20XX
        if (y.length === 2) y = "20" + y;
        
        // Determine if format is DD/MM/YYYY or MM/DD/YYYY by checking if first part > 12
        const firstNum = parseInt(d, 10);
        const secondNum = parseInt(m, 10);
        
        // If first part > 12, it's likely DD/MM/YYYY
        if (firstNum > 12 && secondNum <= 12) {
          // Swap day and month
          [d, m] = [m, d];
        }
        
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
    }
    
    // If already in YYYY-MM-DD format, validate and return
    if (cleaned.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return cleaned;
    }
    
    // Fallback: try to parse as Date
    try {
      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
    } catch (e) {
      // Ignore
    }
    
    // Last resort: return today's date
    return new Date().toISOString().slice(0, 10);
  }