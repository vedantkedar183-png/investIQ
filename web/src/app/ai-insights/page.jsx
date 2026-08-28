'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Target,
  Clock,
  ArrowUpRight,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../lib/api';
import TradeModal from '../../components/TradeModal';

export default function AIInsightsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [customAnalysis, setCustomAnalysis] = useState(null);
  const [tradeAsset, setTradeAsset] = useState(null);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await api.getAIRecommendations();
      if (res && res.recommendations) {
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      console.error('Error loading AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const handleCustomAnalyze = async (e) => {
    e.preventDefault();
    if (!searchSymbol.trim()) return;

    setAnalyzing(true);
    try {
      const res = await api.analyzeStock(searchSymbol.trim().toUpperCase());
      if (res && res.symbol) {
        setCustomAnalysis(res);
      } else if (res && res.analysis) {
        setCustomAnalysis(res.analysis); // Fallback just in case
      }
    } catch (err) {
      alert('Error analyzing stock: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleQuickTrade = async (symbol) => {
    try {
      const res = await api.getAssetDetails(symbol);
      if (res && res.asset) {
        setTradeAsset(res.asset);
      }
    } catch (err) {
      console.error('Failed to open trade modal:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-blue-950/40 p-6 md:p-8 rounded-3xl border border-indigo-900/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center space-x-1.5 w-max">
              <Sparkles size={14} />
              <span>AI NEWS & SENTIMENT INTELLIGENCE</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              AI-Powered Market Recommendations
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time sentiment scoring, growth catalysts, and risk evaluations synthesized from financial news feeds and Google Gemini AI.
            </p>
          </div>

          <button
            onClick={loadInsights}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center space-x-2 self-start"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="text-xs font-bold">Refresh News Feeds</span>
          </button>
        </div>

        {/* On-Demand Stock Analyzer Form */}
        <form onSubmit={handleCustomAnalyze} className="pt-2 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Analyze any specific stock (e.g. TCS, INFY, TATAMOTORS, NVDA)..."
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs md:text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={analyzing}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>{analyzing ? 'AI Thinking...' : 'Generate AI Assessment'}</span>
          </button>
        </form>
      </div>

      {/* On-Demand Custom AI Assessment Result Card */}
      {customAnalysis && (
        <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 space-y-4 shadow-xl shadow-indigo-500/5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-black">
                {customAnalysis.symbol}
              </span>
              <span className="text-xs text-indigo-400 font-bold">Custom AI Analysis</span>
            </div>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black">
              {customAnalysis.sentiment} ({customAnalysis.confidenceScore}% Confidence)
            </span>
          </div>

          <h3 className="text-lg font-bold text-white">{customAnalysis.headline}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 size={15} />
                <span>Catalysts & Why to {customAnalysis.action}</span>
              </span>
              <ul className="space-y-1.5">
                {customAnalysis.reasoning?.map((r, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-blue-400">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                <AlertTriangle size={15} />
                <span>Key Risks to Monitor</span>
              </span>
              <ul className="space-y-1.5">
                {customAnalysis.risks?.map((rk, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-rose-400">•</span>
                    <span>{rk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Target Price: <strong className="text-white text-sm">{customAnalysis.targetPrice}</strong> ({customAnalysis.targetHorizon})
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/stock/${customAnalysis.symbol}`}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                View Full Chart
              </Link>
              <button
                onClick={() => handleQuickTrade(customAnalysis.symbol)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition"
              >
                Trade {customAnalysis.symbol}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Curated AI News Recommendations List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <span>Top AI Stock Recommendations</span>
        </h3>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Synthesizing news sentiment...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((item) => {
              const isBullish = item.sentiment === 'BULLISH';
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl transition"
                >
                  <div className="space-y-3">
                    {/* Top Metadata */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/stock/${item.symbol}`}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 font-black text-xs hover:bg-blue-600/30 transition"
                        >
                          {item.symbol}
                        </Link>
                        <span className="text-xs text-slate-400">{item.source} • {item.publishedAt}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                          isBullish ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {item.sentiment} ({item.confidenceScore}%)
                      </span>
                    </div>

                    {/* Headline */}
                    <h4 className="text-sm font-bold text-white leading-snug">{item.headline}</h4>

                    {/* Reasoning points */}
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        AI Reasoning & Catalysts:
                      </p>
                      <ul className="space-y-1">
                        {item.reasoning?.map((point, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-[11px]">
                            <span className="text-blue-400">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Target & Horizon Bar */}
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 text-slate-400">
                        <Target size={14} className="text-emerald-400" />
                        <span>Target: <strong className="text-white">{item.targetPrice}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-400">
                        <Clock size={14} className="text-blue-400" />
                        <span>Horizon: <strong className="text-slate-200">{item.targetHorizon}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/60">
                    <Link
                      href={`/stock/${item.symbol}`}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 text-center transition flex items-center justify-center space-x-1"
                    >
                      <span>Analyze {item.symbol}</span>
                      <ArrowUpRight size={14} />
                    </Link>
                    <button
                      onClick={() => handleQuickTrade(item.symbol)}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition shadow-md shadow-blue-600/25"
                    >
                      Trade Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trade Modal */}
      {tradeAsset && (
        <TradeModal
          asset={tradeAsset}
          initialType="BUY"
          onClose={() => setTradeAsset(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
