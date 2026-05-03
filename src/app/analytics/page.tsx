"use client";

import { useEffect, useState, useCallback } from "react";
import { getIncidents, type Incident } from "@/lib/api";
import useAuth from "@/lib/useAuth";

export default function AnalyticsPage() {
  const { loading: authLoading } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (authLoading) return null;

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-4">
          Computing Security Metrics...
        </p>
      </div>
    );
  }

  const stats = {
    total: incidents.length,
    active: incidents.filter(i => i.status === 'active').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    escalated: incidents.filter(i => i.status === 'escalated').length,
    avgRisk: incidents.length > 0 
      ? Math.round(incidents.reduce((acc, i) => acc + i.risk_score, 0) / incidents.length) 
      : 0
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">
          Security <span className="text-indigo-500">Analytics</span>
        </h2>
        <p className="text-slate-500 font-medium mt-1">
          Historical performance and threat distribution metrics.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Incidents" value={stats.total} icon="📊" />
        <MetricCard title="Active Threats" value={stats.active} icon="🛡️" color="text-indigo-500" />
        <MetricCard title="Avg Risk Score" value={`${stats.avgRisk}%`} icon="🔥" color="text-rose-500" />
        <MetricCard title="Resolved" value={stats.resolved} icon="✅" color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Threat Distribution</h3>
          <div className="space-y-4">
            <DistributionBar label="Active" count={stats.active} total={stats.total} color="bg-indigo-500" />
            <DistributionBar label="Escalated" count={stats.escalated} total={stats.total} color="bg-rose-500" />
            <DistributionBar label="Resolved" count={stats.resolved} total={stats.total} color="bg-emerald-500" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="text-lg font-bold text-white">System Integrity</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">
            The detection engine is currently monitoring all network ingress points with {stats.avgRisk}% baseline risk detection.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color = "text-white" }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className={`text-4xl font-black tracking-tight ${color}`}>{value}</div>
    </div>
  );
}

function DistributionBar({ label, count, total, color }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-500">{count} ({Math.round(percentage)}%)</span>
      </div>
      <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
