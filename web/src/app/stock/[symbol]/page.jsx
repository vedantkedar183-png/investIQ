'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Sparkles,
  ArrowLeft,
  Activity,
  ShieldCheck,
  Building,
  BarChart2,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { api } from '../../../lib/api';
import PriceChart from '../../../components/PriceChart';
import FiftyTwoWeekRangeBar from '../../../components/52WeekRangeBar';
import TradeModal from '../../../components/TradeModal';

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol || 'RELIANCE').toUpperCase();

  const [asset, setAsset] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [assetRes, wlRes, aiRes] = await Promise.all([
        api.getAssetDetails(symbol),
        api.getWatchlist().catch(() => ({ items: [] })),
        api.analyzeStock(symbol).catch(() => null),
      ]);

      if (assetRes && assetRes.asset) {
        setAsset(assetRes.asset);
      }
      if (wlRes && wlRes.items) {
        const found = wlRes.items.some((i) => i.symbol.toUpperCase() === symbol);
        setIsStarred(found);
      }
      if (aiRes) {
        setAiInsight(aiRes.analysis || aiRes);
      }
    } catch (err) {
      console.error('Error loading stock detail:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleWatchlist = async () => {
    try {
      const res = await api.toggleWatchlist(symbol);
      if (res) {
        setIsStarred(res.isBookmarked);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  const openTrade = (type) => {
    setTradeType(type);
    setTradeModalOpen(true);
  };

  if (loading && !asset) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Loading comprehensive market data for {symbol}...
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="py-20 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Stock {symbol} not found</h3>
        <button
          onClick={() => router.push('/search')}
          className="px-4 py-2 bg-blue-600 rounded-xl text-white text-xs font-bold"
        >
          Return to Search
        </button>
      </div>
    );
  }

  const isProfit = (asset.changePercent || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Top Header Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-white">{asset.name}</h2>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-bold">
                {asset.exchange || 'NSE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {asset.symbol} • {asset.sector || asset.category}
            </p>
          </div>
        </div>

        {/* Watchlist & Trading Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleWatchlist}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition ${
              isStarred
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Star size={15} fill={isStarred ? 'currentColor' : 'none'} />
            <span>{isStarred ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>
          <button
            onClick={() => openTrade('BUY')}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition"
          >
            BUY
          </button>
          <button
            onClick={() => openTrade('SELL')}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition"
          >
            SELL
          </button>
        </div>
      </div>

      {/* Main Grid: Price Chart + 52-Week & Fundamentals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-8 space-y-6">
          <PriceChart symbol={asset.symbol} defaultPrice={asset.currentPrice} />

          {/* Technical Analysis & Patterns Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity size={18} className="text-indigo-400" />
              <span>Technical & Pattern Signals</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Technical Signal</span>
                <p
                  className={`text-lg font-black ${
                    asset.technicalSignal === 'STRONG_BUY' || asset.technicalSignal === 'BUY'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {asset.technicalSignal || 'BUY'}
                </p>
                <p className="text-[10px] text-slate-500">Based on moving averages & momentum</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Chart Pattern</span>
                <p className="text-sm font-bold text-blue-400 truncate">
                  {asset.pattern || 'Consolidation Breakout'}
                </p>
                <p className="text-[10px] text-slate-500">Active price pattern</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">RSI (14)</span>
                <p className="text-lg font-black text-white">{asset.rsi || 58.4}</p>
                <p className="text-[10px] text-slate-500">Neutral / Healthy Momentum</p>
              </div>
            </div>
          </div>

          {/* Company Overview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Building size={18} className="text-blue-400" />
              <span>About {asset.name}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {asset.description ||
                `${asset.name} is a leading entity listed on ${asset.exchange || 'NSE'} active in ${asset.sector || 'Indian Markets'}.`}
            </p>
          </div>
        </div>

        {/* Right Column: 52-Week Range + Fundamentals + AI Analysis */}
        <div className="lg:col-span-4 space-y-6">
          {/* 52-Week Range */}
          <FiftyTwoWeekRangeBar
            currentPrice={asset.currentPrice}
            low52Week={asset.low52Week}
            high52Week={asset.high52Week}
          />

          {/* Fundamental Ratios Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BarChart2 size={16} className="text-blue-400" />
              <span>Key Fundamentals & Valuation</span>
            </h3>

            <div className="divide-y divide-slate-800/80 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Market Capitalization</span>
                <span className="font-bold text-white">{asset.marketCap || 'N/A'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">P/E Ratio (TTM)</span>
                <span className="font-bold text-white">{asset.peRatio || 'N/A'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">P/B Ratio</span>
                <span className="font-bold text-white">{asset.pbRatio || 'N/A'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Dividend Yield</span>
                <span className="font-bold text-emerald-400">{asset.dividendYield ? `${asset.dividendYield}%` : 'N/A'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Return on Equity (ROE)</span>
                <span className="font-bold text-white">{asset.roe ? `${asset.roe}%` : 'N/A'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Daily Trading Volume</span>
                <span className="font-bold text-white">{asset.volume || '5.2M'}</span>
              </div>
            </div>
          </div>

          {/* AI Stock Assessment Box */}
          {aiInsight && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-900/40 rounded-3xl p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-indigo-400">
                  <Sparkles size={16} />
                  <span className="text-xs font-bold text-white">AI News Recommendation</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                  {aiInsight.sentiment} ({aiInsight.confidenceScore}%)
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-200">{aiInsight.headline}</p>

              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] text-slate-400 font-bold uppercase">Key Growth Catalysts:</p>
                <ul className="space-y-1">
                  {aiInsight.reasoning?.map((r, i) => (
                    <li key={i} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                      <span className="text-blue-400 font-bold mt-0.5">•</span>
                      <span className="leading-tight">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Horizon:</span>
                <span className="font-bold text-indigo-300">{aiInsight.targetHorizon} ({aiInsight.targetPrice})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trade Modal */}
      {tradeModalOpen && (
        <TradeModal
          asset={asset}
          initialType={tradeType}
          onClose={() => setTradeModalOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
