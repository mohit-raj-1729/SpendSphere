"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/signin";
      const body = isSignUp ? { email, password, name } : { email, password };

      let res;
      try {
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (fetchError: any) {
        // Network error (server not running, connection failed, etc.)
        throw new Error(
          `Network error: ${fetchError.message || "Could not connect to server. Make sure the dev server is running."}`
        );
      }

      // Check if response is ok before trying to parse JSON
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        // Response is not valid JSON
        throw new Error(`Server returned invalid response. Status: ${res.status}`);
      }

      if (!res.ok) {
        // Show the error message from the API
        const errorMessage = data.error || `Server error: ${res.status}`;
        throw new Error(errorMessage);
      }

      // For sign up, session might be null if email confirmation is required
      if (isSignUp && !data.session) {
        setError(data.message || "Account created! Please check your email to confirm your account.");
        // Clear form
        setEmail("");
        setPassword("");
        setName("");
        return;
      }

      // For sign in, session is required
      if (!isSignUp && !data.session) {
        throw new Error("No session returned. Please check your Supabase configuration.");
      }

      // Store session in localStorage
      if (data.session) {
        localStorage.setItem("supabase_session", JSON.stringify(data.session));
        localStorage.setItem("user_id", data.user.id);
        localStorage.setItem("user_email", data.user.email);
      }

      // Redirect to dashboard
      router.push("/app");
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
            <span className="relative text-xs font-extrabold tracking-tighter">SS</span>
          </div>
          <div>
            <div className="text-sm font-semibold">SpendSphere</div>
            <div className="text-[11px] text-slate-400">Smart budgeting</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
            {/* Toggle between Login and Sign Up */}
            <div className="flex gap-2 mb-6 p-1 bg-slate-50 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                }}
                className={`flex-1 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  !isSignUp
                    ? "bg-violet-500 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                }}
                className={`flex-1 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isSignUp
                    ? "bg-violet-500 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign up
              </button>
            </div>

            <h1 className="text-xl font-semibold mb-2">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-xs text-slate-500 mb-6">
              {isSignUp
                ? "Start tracking your finances today"
                : "Sign in to access your dashboard"}
            </p>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-medium text-slate-700 mb-1.5"
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                  placeholder="••••••••"
                />
                {isSignUp && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Must be at least 6 characters
                  </p>
                )}
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600">
                    <input
                      type="checkbox"
                      className="w-3 h-3 rounded border-slate-300 text-violet-500 focus:ring-violet-400"
                    />
                    <span>Remember me</span>
                  </label>
                  <a
                    href="#"
                    className="text-violet-600 hover:text-violet-700 font-medium"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-2xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? "Processing..."
                  : isSignUp
                    ? "Create account"
                    : "Log in"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 text-center">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setEmail("");
                    setPassword("");
                    setName("");
                    setError(null);
                  }}
                  className="text-violet-600 hover:text-violet-700 font-medium"
                >
                  {isSignUp ? "Log in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-4">
            By continuing, you agree to SpendSphere' Terms of Service and Privacy
            Policy.
          </p>
        </div>
      </main>
    </div>
  );
}
