"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getIncident, type Incident } from "@/lib/api";
import { ChevronLeft, ShieldAlert, Activity, Database, Terminal } from "lucide-react";
import useAuth from "@/lib/useAuth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function IncidentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { loading: authLoading } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    async function loadIncident() {
      try {
        const data = await getIncident(id);
        setIncident(data);
      } catch (error) {
        console.error("Failed to load incident:", error);
      } finally {
        setLoading(false);
      }
    }
    loadIncident();
  }, [id]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">Initializing Investigation...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Dashboard</span>
        </Link>
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-2xl text-center">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Incident Not Found</h1>
          <p className="text-slate-400">The requested incident ID does not exist in the intelligence database.</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-rose-500";
    if (score >= 50) return "text-amber-500";
    return "text-emerald-500";
  };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border";
    switch (status) {
      case "resolved":
        return `${base} bg-emerald-500/10 text-emerald-500 border-emerald-500/20`;
      case "escalated":
        return `${base} bg-rose-500/10 text-rose-500 border-rose-500/20`;
      default:
        return `${base} bg-slate-700 text-slate-300 border-slate-600`;
    }
  };

  const analysis = incident.analysis || {
    threat_type: "Unknown",
    severity: "Low",
    explanation: "No automated analysis available for this incident.",
    recommended_action: "Manual investigation required."
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header / Breadcrumb */}
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors mb-8 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
      </Link>

      <div className="flex flex-col gap-8">
        {/* Main Incident Info */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-2">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Investigation Object</div>
            <h1 className="text-4xl font-black text-white tracking-tighter font-mono">
              {incident.source_ip}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-mono text-xs">ID: {incident.id}</span>
              <span className={getStatusBadge(incident.status)}>{incident.status}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl min-w-[140px] text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Level</div>
              <div className={`text-4xl font-black ${getRiskColor(incident.risk_score)}`}>
                {incident.risk_score}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl min-w-[140px] text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Severity</div>
              <div className={`text-2xl font-black uppercase tracking-tight ${getRiskColor(incident.risk_score)}`}>
                {analysis.severity}
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <ShieldAlert className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-black text-white uppercase tracking-widest">AI Intelligence Report</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Threat Classification</div>
                  <div className="text-xl font-bold text-slate-100">{analysis.threat_type}</div>
                </div>
                
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Technical Analysis</div>
                  <p className="text-slate-300 leading-relaxed bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl italic">
                    "{analysis.explanation}"
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">
                  <Activity className="w-4 h-4" />
                  Recommended Action
                </div>
                <div className="text-slate-200 font-medium">
                  {analysis.recommended_action}
                </div>
              </div>
            </section>

            {/* Event Info */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                <div className="bg-slate-800 p-3 rounded-xl">
                  <Database className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Events</div>
                  <div className="text-2xl font-black text-white">{incident.event_count}</div>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                <div className="bg-slate-800 p-3 rounded-xl">
                  <Activity className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Observed</div>
                  <div className="text-lg font-bold text-white">
                    {new Date(incident.last_seen).toLocaleString()}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Raw Data */}
          <div className="space-y-8">
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <button 
                onClick={() => setShowRaw(!showRaw)}
                className="w-full flex items-center justify-between text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-slate-500" />
                  <span className="text-xs font-black uppercase tracking-widest">Raw Evidence</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-800 rounded">
                  {showRaw ? "Hide" : "Show"}
                </span>
              </button>
              
              {showRaw && (
                <div className="mt-6">
                  <div className="bg-black/40 rounded-xl p-4 overflow-x-auto border border-slate-800">
                    <pre className="text-[10px] text-slate-400 font-mono leading-relaxed">
                      {JSON.stringify(incident, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}