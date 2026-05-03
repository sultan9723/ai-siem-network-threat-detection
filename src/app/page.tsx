"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Activity, LogOut, Search, Filter, RefreshCw, AlertCircle, Clock } from "lucide-react";
import { getIncidents, logout, type Incident } from "@/lib/api";
import IncidentCard from "@/components/IncidentCard";
import useAuth from "@/lib/useAuth";

export default function Dashboard() {
  const { loading: authLoading } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const data = await getIncidents();
      setIncidents(data);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Secure link interrupted. Attempting to re-establish connection...");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (authLoading) return null;

  const escalatedCount = incidents.filter(i => i.status === 'escalated').length;
  const avgRisk = incidents.length > 0 ? Math.round(incidents.reduce((a, b) => a + b.risk_score, 0) / incidents.length) : 0;

  if (loading && incidents.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-white uppercase tracking-wider">Syncing SOC Data</p>
          <p className="text-slate-500 font-mono text-[10px]">Establishing secure intelligence stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Dashboard Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Security <span className="text-indigo-500">Overview</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Real-time monitoring of network anomalies and heuristic threat analysis.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="enterprise-card px-6 py-3 flex items-center gap-6 border-white/5">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Critical</span>
              <div className="text-xl font-bold text-rose-500 font-mono leading-none">{escalatedCount}</div>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Risk Index</span>
              <div className="text-xl font-bold text-amber-500 font-mono leading-none">{avgRisk}%</div>
            </div>
          </div>
        </div>
      </header>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 bg-slate-900/40 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search Intelligence..." 
            className="bg-transparent border-none focus:ring-0 text-sm text-slate-300 placeholder-slate-600 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={() => fetchData()} className="enterprise-card px-4 py-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Sync
          </button>
          <button onClick={() => { logout(); router.push("/login"); }} className="enterprise-card px-4 py-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:bg-rose-500/5 transition-all flex items-center gap-2">
            <LogOut className="w-3 h-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <section className="space-y-8">
        {error && (
          <div className="bg-rose-500/5 border border-rose-500/10 text-rose-500 p-4 rounded-xl flex items-center gap-3 animate-pulse">
            <AlertCircle className="w-4 h-4" />
            <div className="text-xs font-bold">{error}</div>
          </div>
        )}

        {incidents.length === 0 ? (
          <div className="enterprise-card py-24 flex flex-col items-center justify-center text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-slate-800" />
            <div className="space-y-1 px-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Perimeter Secure</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-xs leading-relaxed font-medium">
                Full system scan completed. Zero network anomalies identified in current stream.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} onStatusUpdate={fetchData} />
            ))}
          </div>
        )}
      </section>

      {/* Footer Meta */}
      <footer className="flex items-center justify-center gap-8 py-10 border-t border-white/5 opacity-40 grayscale">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Secure Protocol 1.0.4-PRO
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
          <Clock className="w-3 h-3" /> {new Date().toISOString().substring(11, 19)} UTC
        </div>
      </footer>
    </div>
  );
}
