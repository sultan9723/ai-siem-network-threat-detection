"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout, checkHealth } from "@/lib/api";
import useAuth from "@/lib/useAuth";

export default function SettingsPage() {
  const { loading: authLoading } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const router = useRouter();

  const apiEndpoint = process.env.NEXT_PUBLIC_API_URL || "INTELLIGENCE_LINK_PENDING";

  useEffect(() => {
    const verifyStatus = async () => {
      const status = await checkHealth();
      setIsOnline(status);
    };
    verifyStatus();
  }, []);

  if (authLoading) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">
          System <span className="text-indigo-500">Settings</span>
        </h2>
        <p className="text-slate-500 font-medium mt-1">
          Configure dashboard preferences and manage your session.
        </p>
      </header>

      <div className="space-y-6">
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Environment Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-sm font-bold text-slate-400">API Endpoint</span>
              <code className="text-xs bg-slate-950 px-3 py-1 rounded text-indigo-400 font-mono">
                {apiEndpoint}
              </code>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-sm font-bold text-slate-400">System Status</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isOnline === null ? 'bg-slate-500' : isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                <span className={`text-xs font-bold uppercase ${isOnline === null ? 'text-slate-500' : isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isOnline === null ? 'Checking...' : isOnline ? 'Operational' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-400">Encryption</span>
              <span className="text-xs font-bold text-slate-500 uppercase">AES-256-GCM / JWT</span>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Account Actions</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Logging out will clear your session token from local storage. You will need to re-authenticate to access the SIEM intelligence stream.
          </p>
          <button
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-rose-500 text-white font-black py-3 px-8 rounded-xl transition-all uppercase tracking-widest text-xs"
          >
            Terminate Session
          </button>
        </section>

        <div className="text-center">
          <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em]">
            AI SIEM v1.0.0-PRO
          </p>
        </div>
      </div>
    </div>
  );
}
