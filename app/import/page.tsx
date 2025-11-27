"use client";

import React, { useState } from "react";

type TxPreview = {
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  type: "income" | "expense";
  category: string;
};

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;


export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<TxPreview[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setImported(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "preview");

    const res = await fetch("/api/import-bank", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setError("Failed to parse file. Please check CSV format.");
      setLoading(false);
      return;
    }

    const data = (await res.json()) as { transactions: TxPreview[] };
    setPreview(data.transactions);
    setLoading(false);
  };

  const handleImport = async () => {
    if (!file) return;
    
    // Get user_id from localStorage (set during login)
    const userId = localStorage.getItem("user_id");
    
    if (!userId) {
      // Redirect to login if not logged in
      window.location.href = "/auth";
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "import");
    formData.append("user_id", userId); // ← Add this line

    const res = await fetch("/api/import-bank", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Import failed.");
      setLoading(false);
      return;
    }

    setImported(data.imported);
    setLoading(false);

    //Redirecting to dashboard after 1.5 seconds
    setTimeout(() => {
        window.location.href = "/app";
    }, 1500);
  };


  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <header className="h-16 px-8 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Import bank statement</h1>
          <p className="text-[11px] text-slate-400">
            Upload CSV from HDFC, SBI, ICICI etc. We’ll parse, categorise, and import.
          </p>
        </div>
        <a href="/app" className="text-xs text-slate-500 hover:text-slate-800">
          ← Back to dashboard
        </a>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-4">
        <section className="bg-white rounded-3xl border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">1. Upload CSV</p>
              <p className="text-[11px] text-slate-400">
                Export from your bank (CSV), then drop it here. We support common formats.
              </p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setPreview(null);
                setImported(null);
              }}
              className="text-xs"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handlePreview}
              disabled={!file || loading}
              className="px-4 py-1.5 rounded-full text-xs bg-violet-500 text-white disabled:opacity-60"
            >
              {loading ? "Processing..." : "Preview transactions"}
            </button>
            <button
              onClick={handleImport}
              disabled={!file || !preview || loading}
              className="px-4 py-1.5 rounded-full text-xs bg-emerald-500 text-white disabled:opacity-60"
            >
              Import all
            </button>
          </div>
          {error && (
            <p className="mt-2 text-[11px] text-rose-500">
              {error}
            </p>
          )}
          {imported !== null && (
            <p className="mt-2 text-[11px] text-emerald-600">
              Successfully imported {imported} transactions into your account.
            </p>
          )}
        </section>

        {preview !== null && (
          <section className="bg-white rounded-3xl border border-slate-200 p-4">
                        <p className="text-sm font-semibold mb-1">Preview ({preview.length} transactions)</p>
            {preview.length === 0 ? (
              <p className="text-[11px] text-rose-500">
                We couldn&apos;t detect any transactions in this CSV. Please check that
                the file has columns like Date, Description and Debit/Credit or Amount.
              </p>
            ) : (
              <>
                <p className="text-[11px] text-slate-400 mb-3">
                  This is how we understood your bank statement. Categories are auto-detected
                  based on merchant/keywords.
                </p>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto text-[11px]">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-50">
                      <tr className="text-slate-500">
                        <th className="text-left px-2 py-1 border-b border-slate-200">
                          Date
                        </th>
                        <th className="text-left px-2 py-1 border-b border-slate-200">
                          Description
                        </th>
                        <th className="text-left px-2 py-1 border-b border-slate-200">
                          Category
                        </th>
                        <th className="text-left px-2 py-1 border-b border-slate-200">
                          Type
                        </th>
                        <th className="text-right px-2 py-1 border-b border-slate-200">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                    {preview.map((t, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="px-2 py-1">{t.date}</td>
                          <td className="px-2 py-1 text-slate-700">{t.description}</td>
                          <td className="px-2 py-1 text-slate-500">{t.category}</td>
                          <td className="px-2 py-1">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                t.type === "income"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {t.type}
                            </span>
                          </td>
                          <td
                            className={`px-2 py-1 text-right font-medium ${
                              t.type === "income" ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {t.type === "income" ? "+" : "-"}
                            {formatINR(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}