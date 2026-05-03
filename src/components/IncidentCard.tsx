import React, { useState } from "react";
import Link from "next/link";
import { Activity, Clock, ArrowRight, ShieldAlert } from "lucide-react";
import type { Incident } from "@/lib/api";
import { updateIncident } from "@/lib/api";

interface Props {
  incident: Incident;
  onStatusUpdate?: () => void;
}

const IncidentCard: React.FC<Props> = ({ incident, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-rose-500 border-rose-500/20 bg-rose-500/5";
    if (score >= 50) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
  };

  const handleAction = async (e: React.MouseEvent, newStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    if (!confirm(`Confirm status change to ${newStatus}?`)) return;

    setLoading(true);
    try {
      const success = await updateIncident(incident.id, newStatus);
      if (success) window.location.reload();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const { source_ip, risk_score, status, event_count, last_seen, analysis } = incident;

  return (
    <Link href={`/incidents/${incident.id}`} className="group block">
      <div className="enterprise-card p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
        {/* Risk Score Circle */}
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-mono ${getRiskColor(risk_score)}`}>
            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">Risk</span>
            <span className="text-xl font-bold leading-none">{risk_score}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-lg font-bold text-white font-mono tracking-tight">{source_ip}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
              status === 'resolved' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 
              status === 'escalated' ? 'bg-rose-500/5 text-rose-500 border-rose-500/20' : 'bg-slate-800 text-slate-400 border-white/5'
            }`}>
              {status}
            </span>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-2 max-w-2xl">
            {analysis?.explanation || "Awaiting intelligence briefing..."}
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold text-slate-400">{event_count} Events Detected</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold text-slate-400">
                {new Date(last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="flex flex-row md:flex-col gap-3 w-full md:w-[160px] flex-shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/5 md:pl-10">
          <button
            onClick={(e) => handleAction(e, "resolved")}
            disabled={loading || status === 'resolved'}
            className="flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 border border-white/5 transition-all disabled:opacity-20"
          >
            Resolve
          </button>
          <button
            onClick={(e) => handleAction(e, "escalated")}
            disabled={loading || status === 'escalated'}
            className="flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 border border-white/5 transition-all disabled:opacity-20"
          >
            Escalate
          </button>
          <div className="hidden md:flex items-center justify-center text-indigo-500 group-hover:text-indigo-400 transition-colors">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IncidentCard;
