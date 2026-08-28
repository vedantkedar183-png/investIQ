'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  TrendingUp,
  PieChart,
  BookmarkCheck,
  Sparkles,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Search & Explore', href: '/search', icon: Search },
  { label: 'Mutual Funds', href: '/mutual-funds', icon: PieChart },
  { label: 'Watchlist', href: '/watchlist', icon: BookmarkCheck },
  { label: 'AI News Insights', href: '/ai-insights', icon: Sparkles, badge: 'AI' },
  { label: 'Reports & Logs', href: '/reports', icon: FileText },
  { label: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d1527] border-r border-slate-800 flex flex-col justify-between h-[calc(100vh-41px)] sticky top-[41px] select-none">
      <div className="p-4 space-y-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center">
              invest<span className="text-blue-400">IQ</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Smart Investment OS</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Virtual Mode Indicator */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <ShieldCheck size={14} />
            <span>Virtual Simulation Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Trade stocks and funds risk-free with live market pricing.
          </p>
        </div>
      </div>
    </aside>
  );
}
