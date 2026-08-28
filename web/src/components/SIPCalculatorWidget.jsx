'use client';

import React, { useState } from 'react';
import { calculateSIP, calculateLumpsum } from '@investiq/shared';
import { Calculator, Sparkles } from 'lucide-react';

export default function SIPCalculatorWidget() {
  const [calcType, setCalcType] = useState('SIP'); // 'SIP' or 'LUMPSUM'
  const [investment, setInvestment] = useState(10000);
  const [rate, setRate] = useState(14);
  const [years, setYears] = useState(10);

  const result =
    calcType === 'SIP'
      ? calculateSIP(investment, rate, years)
      : calculateLumpsum(investment, rate, years);

  const investedPercent = result.totalValue > 0 ? (result.investedAmount / result.totalValue) * 100 : 50;
  const returnsPercent = 100 - investedPercent;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Calculator size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Investment Growth Calculator</h3>
            <p className="text-xs text-slate-400">Estimate your wealth creation over time</p>
          </div>
        </div>

        {/* Toggle SIP / Lumpsum */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              setCalcType('SIP');
              if (investment > 100000) setInvestment(10000);
            }}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              calcType === 'SIP' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly SIP
          </button>
          <button
            onClick={() => {
              setCalcType('LUMPSUM');
              if (investment < 25000) setInvestment(100000);
            }}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              calcType === 'LUMPSUM' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            One-time Lumpsum
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sliders Area */}
        <div className="lg:col-span-7 space-y-5">
          {/* Investment Amount */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">
                {calcType === 'SIP' ? 'Monthly Investment' : 'Total Investment'}
              </span>
              <span className="text-blue-400 font-bold">₹{investment.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={calcType === 'SIP' ? 500 : 5000}
              max={calcType === 'SIP' ? 100000 : 2000000}
              step={calcType === 'SIP' ? 500 : 5000}
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Expected Rate of Return */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Expected Annual Return (p.a.)</span>
              <span className="text-emerald-400 font-bold">{rate}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Time Period */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Investment Horizon</span>
              <span className="text-indigo-400 font-bold">{years} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Expected Total Value
            </span>
            <h4 className="text-2xl font-black text-white mt-0.5">
              ₹{result.totalValue.toLocaleString('en-IN')}
            </h4>
          </div>

          {/* Visual Bar */}
          <div className="space-y-1.5">
            <div className="h-3 rounded-full overflow-hidden flex bg-slate-800">
              <div className="bg-slate-500 h-full" style={{ width: `${investedPercent}%` }} />
              <div className="bg-emerald-500 h-full" style={{ width: `${returnsPercent}%` }} />
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="flex items-center text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500 mr-1.5"></span>
                Invested: ₹{result.investedAmount.toLocaleString('en-IN')}
              </span>
              <span className="flex items-center text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                Gain: ₹{result.estimatedReturns.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
