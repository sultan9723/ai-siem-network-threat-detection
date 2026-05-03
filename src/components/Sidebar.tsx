"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Settings, ShieldCheck, Terminal } from "lucide-react";

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-slate-950/20 backdrop-blur-3xl flex flex-col hidden md:flex h-full relative z-50">
      <div className="p-8 flex-1">
        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8">
          Intelligence
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all duration-300 group uppercase tracking-widest ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-6 border-t border-white/5">
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              Secure Protocol
            </div>
            <div className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Enterprise AI correlation active. Nodes synced at <span className="text-slate-400 font-mono">1.0.4-PRO</span>.
            </div>
          </div>
          <ShieldCheck className="absolute -bottom-4 -right-4 w-16 h-16 text-indigo-500/10 rotate-12 transition-transform group-hover:scale-110" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
