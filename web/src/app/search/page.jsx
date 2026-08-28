'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import TradeModal from '../../components/TradeModal';

const ASSET_TABS = [
  { label: 'All Assets', value: 'ALL' },
  { label: 'Stocks', value: 'STOCK' },
  { label: 'Mutual Funds', value: 'MUTUAL_FUND' },
  { label: 'Fixed Deposits (FD)', value: 'FD' },
  { label: 'Govt Bonds', value: 'BOND' },
  { label: 'Futures & Options', value: 'FNO' },
];

const RISK_FILTERS = [
  { label: 'All Risk Levels', value: 'ALL' },
  { label: 'Low Risk', value: 'LOW' },
  { label: 'Moderate Risk', value: 'MODERATE' },
  { label: 'High Risk', value: 'HIGH' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [minReturn, setMinReturn] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [results, setResults] = useState([]);
  const [watchlistSymbols, setWatchlistSymbols] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tradeAsset, setTradeAsset] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (debouncedQuery.trim()) params.q = debouncedQuery.trim();
      if (selectedTab !== 'ALL') params.type = selectedTab;
      if (selectedRisk !== 'ALL') params.risk = selectedRisk;
      if (minReturn) params.minReturn = minReturn;
      if (sortBy) params.sort = sortBy;

      const res = await api.searchAssets(params);
      if (res && res.results) {
        setResults(res.results);
      } else {
        setResults([]);
      }

      api.getWatchlist().then((wlRes) => {
        if (wlRes && wlRes.items) {
          setWatchlistSymbols(new Set(wlRes.items.map((i) => i.symbol)));
        }
      }).catch(() => {});
    } catch (err) {
      console.error('Error fetching search assets:', err);
      setResults([]);
      setError(err.message || 'Search failed. The market API may still be waking up — try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedTab, selectedRisk, minReturn, sortBy]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleToggleWatchlist = async (symbol, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.toggleWatchlist(symbol);
      if (res) {
        const next = new Set(watchlistSymbols);
        if (res.isBookmarked) {
          next.add(symbol);
        } else {
          next.delete(symbol);
        }
        setWatchlistSymbols(next);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Investment Discovery & Search</h2>
          <p className="text-xs md:text-sm text-slate-400">
            Find and analyze Stocks, Mutual Funds, FDs, and Bonds with risk-return metrics.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, symbol, sector (e.g., RELIANCE, Parag Parikh, EV, Banking)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-white text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        {/* Asset category tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800/80">
          {ASSET_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedTab(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedTab === tab.value
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Secondary filters (Risk, Sort) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-medium focus:outline-none focus:border-blue-500"
          >
            {RISK_FILTERS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="">Sort: Default</option>
            <option value="gainers">Top Gainers</option>
            <option value="losers">Top Losers</option>
            <option value="returns">Highest 1Y Returns</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>Found <strong className="text-white">{results.length}</strong> matching investment options</span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Searching investments...</div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((asset) => {
            const isStock = asset.type === 'STOCK';
            const isMF = asset.type === 'MUTUAL_FUND';
            const isFD = asset.type === 'FD';
            const isBond = asset.type === 'BOND';
            const isFno = asset.type === 'FNO';
            const isStarred = watchlistSymbols.has(asset.symbol);
            const isProfit = (asset.changePercent || 0) >= 0;

            return (
              <div
                key={asset.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between transition group shadow-sm hover:shadow-lg space-y-4"
              >
                {/* Top Title Bar */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300">
                        {asset.type}
                      </span>
                      {asset.riskLevel && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            asset.riskLevel === 'LOW'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : asset.riskLevel === 'MODERATE'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {asset.riskLevel} RISK
                        </span>
                      )}
                    </div>
                    <Link
                      href={isStock ? `/stock/${asset.symbol}` : isMF ? `/mutual-funds` : '#'}
                      className="block font-bold text-white text-base group-hover:text-blue-400 transition"
                    >
                      {asset.name}
                    </Link>
                    <p className="text-[11px] text-slate-400">
                      {asset.symbol} {asset.sector ? `• ${asset.sector}` : asset.category ? `• ${asset.category}` : ''}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleToggleWatchlist(asset.symbol, e)}
                    className={`p-2 rounded-xl border transition ${
                      isStarred
                        ? 'bg-amber-400/20 border-amber-400/40 text-amber-400'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <Star size={16} fill={isStarred ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Body Metrics */}
                {isStock && (
                  <div className="space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-white">
                        ₹{asset.currentPrice.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-xs font-bold flex items-center ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                        {isProfit ? '+' : ''}{asset.changePercent}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <div>
                        <span>P/E Ratio: </span>
                        <strong className="text-slate-200">{asset.peRatio || 'N/A'}</strong>
                      </div>
                      <div>
                        <span>52W High: </span>
                        <strong className="text-slate-200">₹{asset.high52Week}</strong>
                      </div>
                      <div>
                        <span>Pattern: </span>
                        <strong className="text-blue-400">{asset.pattern || 'Consolidation'}</strong>
                      </div>
                      <div>
                        <span>Signal: </span>
                        <strong className="text-emerald-400">{asset.technicalSignal || 'BUY'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {isMF && (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase">NAV: </span>
                        <span className="text-lg font-extrabold text-white">₹{asset.nav}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        {asset.returns3Y ? `${asset.returns3Y}% (3Y CAGR)` : asset.expectedReturns}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <div>
                        <span>Min SIP: </span>
                        <strong className="text-slate-200">₹{asset.minSip}</strong>
                      </div>
                      <div>
                        <span>Exp. Ratio: </span>
                        <strong className="text-slate-200">{asset.expenseRatio}</strong>
                      </div>
                      <div className="col-span-2">
                        <span>Horizon: </span>
                        <strong className="text-indigo-400">{asset.investmentPeriod}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {isFno && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-white">
                        {asset.currentPrice?.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-xs font-bold ${(asset.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {(asset.changePercent || 0) >= 0 ? '+' : ''}
                        {asset.changePercent}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <div>
                        <span>Lot size: </span>
                        <strong className="text-slate-200">{asset.lotSize || 'N/A'}</strong>
                      </div>
                      <div>
                        <span>Expiry: </span>
                        <strong className="text-slate-200">{asset.expiry || 'Near'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {(isFD || isBond) && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-extrabold text-white">
                        {asset.interestRate || asset.yieldPercent}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400">
                        {asset.creditRating}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <p>Tenure / Maturity: <strong className="text-slate-200">{asset.tenure || asset.maturityDate}</strong></p>
                      <p>Min Deposit: <strong className="text-slate-200">₹{asset.minInvestment?.toLocaleString('en-IN')}</strong></p>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/60">
                  {isStock ? (
                    <>
                      <Link
                        href={`/stock/${asset.symbol}`}
                        className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center transition flex items-center justify-center space-x-1"
                      >
                        <span>Charts & Ratios</span>
                        <ArrowUpRight size={13} />
                      </Link>
                      <button
                        onClick={() => setTradeAsset(asset)}
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
                      >
                        Trade
                      </button>
                    </>
                  ) : isMF ? (
                    <>
                      <Link
                        href="/mutual-funds"
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center transition"
                      >
                        Start SIP / Invest
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={() => setTradeAsset(asset)}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                    >
                      Invest in {asset.type}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-2">
          <p className="text-white font-bold text-base">No matching investment options found</p>
          <p className="text-xs text-slate-400">Try changing your search query or reset risk/category filters.</p>
        </div>
      )}

      {/* Trade Modal */}
      {tradeAsset && (
        <TradeModal
          asset={tradeAsset}
          initialType="BUY"
          onClose={() => setTradeAsset(null)}
          onSuccess={() => fetchResults()}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
