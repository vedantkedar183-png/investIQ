import React from 'react';
import { get52WeekRatio } from '@investiq/shared';

export default function FiftyTwoWeekRangeBar({ currentPrice, low52Week, high52Week }) {
  if (!low52Week || !high52Week) return null;

  const ratio = get52WeekRatio(currentPrice, low52Week, high52Week);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">52-Week Price Range</span>
        <span className="text-slate-200 font-bold">
          {ratio}% of 52W Range
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative pt-2 pb-1">
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 rounded-full"
            style={{ width: `${ratio}%` }}
          />
        </div>

        {/* Current Pin Marker */}
        <div
          className="absolute -top-0.5 -translate-x-1/2 flex flex-col items-center pointer-events-none"
          style={{ left: `${Math.min(Math.max(ratio, 5), 95)}%` }}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-500 shadow-md shadow-blue-500/50" />
        </div>
      </div>

      {/* Min & Max Labels */}
      <div className="flex items-center justify-between text-xs">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-semibold">52W Low</p>
          <p className="font-bold text-rose-400">₹{low52Week.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Current</p>
          <p className="font-bold text-white">₹{currentPrice.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">52W High</p>
          <p className="font-bold text-emerald-400">₹{high52Week.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
}
