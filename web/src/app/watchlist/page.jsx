'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookmarkCheck, Star, Trash2, ArrowUpRight, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import TradeModal from '../../components/TradeModal';
import FiftyTwoWeekRangeBar from '../../components/52WeekRangeBar';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeAsset, setTradeAsset] = useState(null);
  const [tradeType, setTradeType] = useState('BUY');

  const loadWatchlist = async () => {
    setLoading(true);
    try {
      const res = await api.getWatchlist();
      if (res) {
        setWatchlist(res);
      }
    } catch (err) {
      console.error('Error loading watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleRemove = async (symbol) => {
    try {
      await api.toggleWatchlist(symbol);
      loadWatchlist();
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  const openTrade = (asset, type = 'BUY') => {
    setTradeAsset(asset);
    setTradeType(type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black text-white">Your Watchlist</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold">
              {watchlist?.count || 0} Assets
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Monitor real-time price movements, technical signals, and trigger instant orders.
          </p>
        </div>

        <Link
          href="/search"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 transition self-start"
        >
          <Plus size={15} />
          <span>Add More Assets</span>
        </Link>
      </div>

      {/* Watchlist Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Loading your watchlist...</div>
      ) : watchlist?.items && watchlist.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {watchlist.items.map((asset) => {
            const isProfit = (asset.changePercent || 0) >= 0;
            const currentPrice = asset.currentPrice || asset.nav || 0;

            return (
              <div
                key={asset.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300">
                        {asset.type}
                      </span>
                      <Link
                        href={asset.type === 'STOCK' ? `/stock/${asset.symbol}` : `/mutual-funds`}
                        className="block font-bold text-white text-base hover:text-blue-400 transition mt-1"
                      >
                        {asset.name}
                      </Link>
                      <p className="text-[11px] text-slate-400">{asset.symbol} • {asset.sector || asset.category}</p>
                    </div>

                    <button
                      onClick={() => handleRemove(asset.symbol)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                      title="Remove from Watchlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Price & Change */}
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-black text-white">
                      ₹{currentPrice.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-xs font-bold flex items-center ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? <TrendingUp size={13} className="mr-0.5" /> : <TrendingDown size={13} className="mr-0.5" />}
                      {isProfit ? '+' : ''}{asset.changePercent}%
                    </span>
                  </div>

                  {/* 52-week bar preview if stock */}
                  {asset.type === 'STOCK' && asset.low52Week && asset.high52Week && (
                    <div className="pt-1">
                      <FiftyTwoWeekRangeBar
                        currentPrice={asset.currentPrice}
                        low52Week={asset.low52Week}
                        high52Week={asset.high52Week}
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/60">
                  {asset.type === 'STOCK' ? (
                    <>
                      <button
                        onClick={() => openTrade(asset, 'BUY')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm shadow-emerald-600/20"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => openTrade(asset, 'SELL')}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm shadow-rose-600/20"
                      >
                        Sell
                      </button>
                      <Link
                        href={`/stock/${asset.symbol}`}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="View Full Charts"
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={() => openTrade(asset, 'BUY')}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                    >
                      Invest in {asset.symbol}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <Star size={36} className="mx-auto text-slate-600" />
          <h3 className="text-lg font-bold text-white">Your Watchlist is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add stocks, mutual funds, or FDs to your watchlist by clicking the star icon across the platform.
          </p>
          <Link
            href="/search"
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
          >
            Browse Investments
          </Link>
        </div>
      )}

      {/* Trade Modal */}
      {tradeAsset && (
        <TradeModal
          asset={tradeAsset}
          initialType={tradeType}
          onClose={() => setTradeAsset(null)}
          onSuccess={() => loadWatchlist()}
        />
      )}
    </div>
  );
}
