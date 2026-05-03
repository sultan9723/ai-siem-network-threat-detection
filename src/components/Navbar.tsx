"use client";

import React, { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";
import { Shield, Radio, ChevronDown } from "lucide-react";

const Navbar: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const verifySystemStatus = async () => {
      const status = await checkHealth();
      setIsOnline(status);
    };

    verifySystemStatus();
    const interval = setInterval(verifySystemStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="h-20 border-b border-white/5 bg-slate-950/20 backdrop-blur-3xl flex items-center justify-between px-10 sticky top-0 z-[60]">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
          AI <span className="text-indigo-500">SIEM</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-8">
        {/* Status Indicator */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
          <div className="relative flex h-2 w-2">
            {isOnline !== false && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline === null ? 'bg-slate-400' : 'bg-emerald-400'} opacity-75`}></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline === null ? 'bg-slate-500' : isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isOnline === null ? 'text-slate-500' : isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isOnline === null ? 'Syncing...' : isOnline ? 'Core Online' : 'Core Offline'}
          </span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-10 w-10 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-indigo-400 group-hover:border-indigo-500/50 transition-all">
            AD
          </div>
          <div className="hidden lg:block">
            <div className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Admin Operator</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Level 4 Access</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
