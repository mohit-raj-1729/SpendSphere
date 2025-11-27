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

         // For demo/hackathon: generate a UUID if not provided
    let finalUserId = userId;
    if (!finalUserId) {
      // Generate a UUID v4 format for demo user
      finalUserId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    const supabase = createClient(url, key);

    const { error } = await supabase.from("transactions").insert(
      parsed.map((t) => ({
        user_id: finalUserId, // Link transactions to user
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
    
    // Handle DD/MM/YYYY or DD-MM-YYYY (Indian format)
    if (cleaned.includes("/") || cleaned.includes("-")) {
      const separator = cleaned.includes("/") ? "/" : "-";
      const parts = cleaned.split(separator);
      
      if (parts.length === 3) {
        let [first, second, third] = parts.map((p) => p.trim());
        
        // If year is 2 digits, assume 20XX
        if (third.length === 2) third = "20" + third;
        
        const firstNum = parseInt(first, 10);
        const secondNum = parseInt(second, 10);
        
        let day: string, month: string, year: string;
        
        // Determine format:
        // If first part > 12, it MUST be DD/MM/YYYY (day can be 1-31, month is 1-12)
        if (firstNum > 12) {
          // DD/MM/YYYY format
          day = first;
          month = second;
          year = third;
        }
        // If second part > 12, it MUST be DD/MM/YYYY
        else if (secondNum > 12) {
          // DD/MM/YYYY format
          day = first;
          month = second;
          year = third;
        }
        // If both <= 12, assume DD/MM/YYYY for Indian context
        else {
          // For Indian format, assume DD/MM/YYYY
          day = first;
          month = second;
          year = third;
        }
        
        // Validate month (1-12)
        const monthNum = parseInt(month, 10);
        if (monthNum < 1 || monthNum > 12) {
          // If invalid, try swapping (might be MM/DD/YYYY)
          [day, month] = [month, day];
        }
        
        // Validate day (1-31)
        const dayNum = parseInt(day, 10);
        if (dayNum < 1 || dayNum > 31) {
          // Invalid date, return today
          return new Date().toISOString().slice(0, 10);
        }
        
        // Validate month again after potential swap
        const finalMonthNum = parseInt(month, 10);
        if (finalMonthNum < 1 || finalMonthNum > 12) {
          return new Date().toISOString().slice(0, 10);
        }
        
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
    
    // If already in YYYY-MM-DD format, validate and return
    if (cleaned.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Validate the date
      const [y, m, d] = cleaned.split("-").map(Number);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return cleaned;
      }
    }
    
    // Fallback: try to parse as Date
    try {
      // Try parsing as DD/MM/YYYY first (Indian format)
      if (cleaned.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/)) {
        const parts = cleaned.split(/[\/\-]/);
        if (parts.length === 3) {
          const [d, m, y] = parts.map(Number);
          const date = new Date(y, m - 1, d);
          if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
            return date.toISOString().slice(0, 10);
          }
        }
      }
      
      // Try standard Date parsing
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