'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../lib/api';

export default function MarketTicker() {
  const [indices, setIndices] = useState([
    { symbol: 'NIFTY 50', value: 24823.15, change: 142.6, changePercent: 0.58, isPositive: true },
    { symbol: 'SENSEX', value: 81332.72, change: 480.25, changePercent: 0.59, isPositive: true },
    { symbol: 'BANK NIFTY', value: 51240.8, change: -85.4, changePercent: -0.17, isPositive: false },
    { symbol: 'NIFTY IT', value: 41850.6, change: 320.1, changePercent: 0.77, isPositive: true },
    { symbol: 'S&P 500', value: 5634.2, change: 24.8, changePercent: 0.44, isPositive: true },
    { symbol: 'NASDAQ', value: 19780.4, change: 110.5, changePercent: 0.56, isPositive: true },
  ]);

  useEffect(() => {
    async function loadIndices() {
      try {
        const res = await api.getIndices();
        if (res && res.indices) {
          setIndices(res.indices);
        }
      } catch (err) {
        // Fallback to default indices
      }
    }
    loadIndices();
    const interval = setInterval(loadIndices, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#0b1120] border-b border-slate-800 text-xs py-2 px-4 overflow-x-auto select-none">
      <div className="flex items-center space-x-6 min-w-max">
        <span className="flex items-center text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
          Live Markets
        </span>
        {indices.map((idx) => {
          const isUp = (idx.change || 0) >= 0;
          return (
            <div key={idx.symbol} className="flex items-center space-x-2">
              <span className="text-slate-300 font-medium">{idx.symbol}</span>
              <span className="text-slate-100 font-semibold">
                {idx.value ? idx.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0.00'}
              </span>
              <span
                className={`flex items-center font-medium ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUp ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                {isUp ? '+' : ''}
                {idx.changePercent ? idx.changePercent.toFixed(2) : '0.00'}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
