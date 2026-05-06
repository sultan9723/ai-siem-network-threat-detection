"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, checkHealth } from "@/lib/api";

// Dev credentials loaded from .env.local (NEXT_PUBLIC_ prefix required for browser access)
const isDev = process.env.NODE_ENV === "development";
const devUsername = process.env.NEXT_PUBLIC_DEV_USERNAME || "";
const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD || "";

export default function LoginPage() {
  const [operatorId, setOperatorId] = useState(
    isDev && devUsername ? devUsername : ""
  );
  const [securityKey, setSecurityKey] = useState(
    isDev && devPassword ? devPassword : ""
  );
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiReachable, setApiReachable] = useState(true);
  const router = useRouter();

  // Auto-fill: restore remembered credentials from browser autofill
  // Browsers use name="username" + autocomplete="username" to populate fields
  useEffect(() => {
    checkHealth().then(setApiReachable).catch(() => setApiReachable(false));
  }, []);

  useEffect(() => {
    // Check if already logged in via token
    const token = localStorage.getItem("auth_token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await login(operatorId, securityKey, rememberMe);

      if (token) {
        router.push("/");
      } else {
        setError("Invalid security credentials. Access denied.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Authentication service unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            SIEM <span className="text-indigo-500">Access</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Enterprise Security Identification Required
          </p>
          {!apiReachable && (
            <p className="text-amber-500 text-xs font-bold mt-2">
              Warning: Backend API unreachable
            </p>
          )}
          {isDev && operatorId && securityKey && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                Dev Mode: Credentials Pre-filled
              </span>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <form
            onSubmit={handleSubmit}
            method="POST"
            autoComplete="on"
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
              >
                Operator ID
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                placeholder="admin"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
              >
                Security Key
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={securityKey}
                onChange={(e) => setSecurityKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-400 font-medium">
                  Remember Me
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest text-sm"
            >
              {loading ? "Verifying..." : "Initialize Session"}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
