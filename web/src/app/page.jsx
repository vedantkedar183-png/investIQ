'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import TradeModal from '../components/TradeModal';
import SIPCalculatorWidget from '../components/SIPCalculatorWidget';

export default function DashboardPage() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [topAssets, setTopAssets] = useState([]);
  const [aiPicks, setAiPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tradeModalAsset, setTradeModalAsset] = useState(null);
  const [tradeModalType, setTradeModalType] = useState('BUY');

  const loadData = async () => {
    try {
      setLoading(true);
      const [portRes, searchRes, aiRes] = await Promise.all([
        api.getPortfolioSummary(),
        api.searchAssets({ type: 'STOCK' }),
        api.getAIRecommendations(),
      ]);

      if (portRes) setPortfolio(portRes);
      if (searchRes && searchRes.results) setTopAssets(searchRes.results.slice(0, 4));
      if (aiRes && aiRes.recommendations) setAiPicks(aiRes.recommendations.slice(0, 2));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('portfolio-updated', handleUpdate);
    return () => window.removeEventListener('portfolio-updated', handleUpdate);
  }, []);

  const openTrade = (asset, type = 'BUY') => {
    setTradeModalAsset(asset);
    setTradeModalType(type);
  };

  const isTotalProfit = (portfolio?.totalPL || 0) >= 0;
  const isTodayProfit = (portfolio?.todayPL || 0) >= 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/20 inline-block mb-2">
            PORTFOLIO OVERVIEW
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-blue-400">{user?.name || 'Investor'}</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time simulated wealth tracking across Stocks, Mutual Funds & Cash.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition border border-slate-700"
            title="Refresh Portfolio"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/search"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-blue-600/25 transition"
          >
            <span>Explore Investments</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Key Portfolio Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Net Worth</span>
            <Wallet size={16} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-black text-white">
            ₹{portfolio?.netWorth?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
          </h3>
          <div className="text-[11px] text-slate-400">
            Invested: ₹{portfolio?.totalInvested?.toLocaleString('en-IN') || '0'}
          </div>
        </div>

        {/* Total Overall P&L */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Overall Returns (P&L)</span>
            {isTotalProfit ? (
              <TrendingUp size={16} className="text-emerald-400" />
            ) : (
              <TrendingDown size={16} className="text-rose-400" />
            )}
          </div>
          <h3 className={`text-2xl font-black ${isTotalProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isTotalProfit ? '+' : ''}₹{portfolio?.totalPL?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
          </h3>
          <div className={`text-[11px] font-semibold ${isTotalProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isTotalProfit ? '+' : ''}{portfolio?.totalPLPercent?.toFixed(2) || '0.00'}% All-time
          </div>
        </div>

        {/* 1-Day Returns */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>1-Day Returns</span>
            {isTodayProfit ? (
              <TrendingUp size={16} className="text-emerald-400" />
            ) : (
              <TrendingDown size={16} className="text-rose-400" />
            )}
          </div>
          <h3 className={`text-2xl font-black ${isTodayProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isTodayProfit ? '+' : ''}₹{portfolio?.todayPL?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
          </h3>
          <div className={`text-[11px] font-semibold ${isTodayProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isTodayProfit ? '+' : ''}{portfolio?.todayPLPercent?.toFixed(2) || '0.00'}% Today
          </div>
        </div>

        {/* Available Cash */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Available Cash</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <h3 className="text-2xl font-black text-white">
            ₹{portfolio?.cashBalance?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
          </h3>
          <div className="text-[11px] text-slate-400">Ready for instant orders</div>
        </div>
      </div>

      {/* Asset Allocation & AI Insights Spotlight Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Asset Allocation Card */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <PieChart size={18} className="text-blue-400" />
              <span>Asset Allocation Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {portfolio?.holdingsCount || 0} Assets Held
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {(portfolio?.assetAllocation || []).map((alloc) => (
              <div key={alloc.name} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: alloc.color }} />
                  <span className="text-[11px] text-slate-400 truncate">{alloc.name}</span>
                </div>
                <p className="text-base font-bold text-white">
                  ₹{alloc.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs font-semibold text-slate-400">{alloc.percentage}%</p>
              </div>
            ))}
          </div>

          {/* Allocation Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800 mt-2">
            {(portfolio?.assetAllocation || []).map((alloc) => (
              <div
                key={alloc.name}
                className="h-full transition-all"
                style={{ width: `${alloc.percentage}%`, backgroundColor: alloc.color }}
                title={`${alloc.name}: ${alloc.percentage}%`}
              />
            ))}
          </div>
        </div>

        {/* AI News Recommendations Spotlight */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-900/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Sparkles size={18} />
              <h3 className="text-base font-bold text-white">AI Stock Insights</h3>
            </div>
            <Link href="/ai-insights" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center">
              <span>View All</span>
              <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {aiPicks.map((pick) => (
              <div
                key={pick.id}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/40 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{pick.symbol}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400">
                      {pick.sentiment} ({pick.confidenceScore}%)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{pick.targetHorizon}</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{pick.headline}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Target: <strong className="text-white">{pick.targetPrice}</strong></span>
                  <Link
                    href={`/stock/${pick.symbol}`}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <span>Analyze</span>
                    <ArrowUpRight size={12} className="ml-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Holdings Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white">Your Holdings</h3>
            <p className="text-xs text-slate-400">Current positions and performance breakdown</p>
          </div>
          <Link
            href="/search"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1 self-start"
          >
            <Plus size={14} />
            <span>Add New Asset</span>
          </Link>
        </div>

        {portfolio?.holdings && portfolio.holdings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">Asset</th>
                  <th className="pb-3 px-3">Quantity</th>
                  <th className="pb-3 px-3">Avg. Buy Price</th>
                  <th className="pb-3 px-3">Current Price</th>
                  <th className="pb-3 px-3">Current Value</th>
                  <th className="pb-3 px-3">Total P&L</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {portfolio.holdings.map((h) => {
                  const isHoldingProfit = h.totalPL >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3">
                        <Link href={`/stock/${h.assetSymbol}`} className="group">
                          <div className="font-bold text-white group-hover:text-blue-400 transition">
                            {h.assetName}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                            <span>{h.assetSymbol}</span>
                            <span>•</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px]">
                              {h.assetType}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-200">{h.quantity}</td>
                      <td className="py-3.5 px-3 text-slate-300">₹{h.averageBuyPrice.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3 font-bold text-white">₹{h.currentPrice.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3 font-bold text-white">₹{h.currentValue.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3">
                        <span className={`font-bold flex items-center ${isHoldingProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isHoldingProfit ? '+' : ''}₹{h.totalPL.toLocaleString('en-IN')} ({h.totalPLPercent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openTrade({ symbol: h.assetSymbol, name: h.assetName, currentPrice: h.currentPrice }, 'BUY')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-[11px] font-bold transition"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => openTrade({ symbol: h.assetSymbol, name: h.assetName, currentPrice: h.currentPrice }, 'SELL')}
                            className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 text-[11px] font-bold transition"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <p className="text-slate-400 text-sm">Your portfolio currently has no holdings.</p>
            <Link
              href="/search"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-xs font-bold transition"
            >
              Start Investing Now
            </Link>
          </div>
        )}
      </div>

      {/* SIP & Wealth Growth Calculator Widget */}
      <SIPCalculatorWidget />

      {/* Trade Modal */}
      {tradeModalAsset && (
        <TradeModal
          asset={tradeModalAsset}
          initialType={tradeModalType}
          onClose={() => setTradeModalAsset(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
