'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, TrendingUp, Shield, Award, User, DollarSign, Calculator, Search } from 'lucide-react';
import { api } from '../../lib/api';
import SIPCalculatorWidget from '../../components/SIPCalculatorWidget';
import TradeModal from '../../components/TradeModal';

export default function MutualFundsPage() {
  const [funds, setFunds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [investModalFund, setInvestModalFund] = useState(null);

  useEffect(() => {
    async function loadFunds() {
      setLoading(true);
      try {
        const res = await api.searchAssets({ type: 'MUTUAL_FUND' });
        if (res && res.results) {
          setFunds(res.results);
        }
      } catch (err) {
        console.error('Error loading funds:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFunds();
  }, []);

  const filteredFunds = funds.filter((f) => {
    if (selectedCategory !== 'ALL' && !f.category?.toLowerCase().includes(selectedCategory.toLowerCase())) {
      return false;
    }
    if (selectedRisk !== 'ALL' && f.riskLevel !== selectedRisk) {
      return false;
    }
    if (search.trim() && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.symbol.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40 p-6 rounded-3xl border border-slate-800 space-y-2">
        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/20 inline-block">
          MUTUAL FUNDS DIRECTORY
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          Explore High-Growth & Bluechip Mutual Funds
        </h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
          Compare 1Y, 3Y, and 5Y CAGR returns, expense ratios, risk ratings, and start simulated SIP investments instantly.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search fund name or AMC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {['ALL', 'Flexi Cap', 'Large Cap', 'Small Cap', 'Hybrid', 'Index'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Risk filter */}
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Risk Levels</option>
          <option value="LOW">Low Risk</option>
          <option value="MODERATE">Moderate Risk</option>
          <option value="HIGH">High Risk</option>
        </select>
      </div>

      {/* Funds Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFunds.map((fund) => (
          <div
            key={fund.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl transition"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300">
                  {fund.category}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                    fund.riskLevel === 'LOW'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : fund.riskLevel === 'MODERATE'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {fund.riskLevel} RISK
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white line-clamp-1">{fund.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manager: {fund.fundManager || 'Top AMC Team'}</p>
              </div>

              {/* NAV and Returns */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">NAV</span>
                  <p className="text-sm font-black text-white">₹{fund.nav}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">3Y CAGR</span>
                  <p className="text-sm font-black text-emerald-400">+{fund.returns3Y || 16.5}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">5Y CAGR</span>
                  <p className="text-sm font-black text-emerald-400">+{fund.returns5Y || 18.2}%</p>
                </div>
              </div>

              {/* Fund details list */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Min. SIP Investment:</span>
                  <strong className="text-slate-200">₹{fund.minSip} / month</strong>
                </div>
                <div className="flex justify-between">
                  <span>Expense Ratio:</span>
                  <strong className="text-slate-200">{fund.expenseRatio}</strong>
                </div>
                <div className="flex justify-between">
                  <span>AUM (Fund Size):</span>
                  <strong className="text-slate-200">{fund.aum}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Ideal Horizon:</span>
                  <strong className="text-indigo-400">{fund.investmentPeriod}</strong>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setInvestModalFund(fund)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition"
            >
              Start Simulated SIP / Invest
            </button>
          </div>
        ))}
      </div>

      {/* SIP Calculator Component */}
      <SIPCalculatorWidget />

      {/* Investment Modal */}
      {investModalFund && (
        <TradeModal
          asset={investModalFund}
          initialType="BUY"
          onClose={() => setInvestModalFund(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
