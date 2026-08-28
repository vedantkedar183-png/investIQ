'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, ShoppingCart, TrendingDown } from 'lucide-react';
import { api } from '../lib/api';

export default function TradeModal({ asset, initialType = 'BUY', onClose, onSuccess }) {
  const [tradeType, setTradeType] = useState(initialType);
  const [orderType, setOrderType] = useState('MARKET');
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState(asset?.currentPrice || asset?.nav || 100);
  const [userCash, setUserCash] = useState(0);
  const [userHolding, setUserHolding] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const currentPrice = asset?.currentPrice || asset?.nav || 100;
  const executionPrice = orderType === 'MARKET' ? currentPrice : parseFloat(limitPrice) || currentPrice;
  const qtyNum = parseFloat(quantity) || 0;
  const totalCost = qtyNum * executionPrice;

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await api.getPortfolioSummary();
        if (res) {
          setUserCash(res.cashBalance || 0);
          const holding = (res.holdings || []).find((h) => h.assetSymbol === asset?.symbol);
          setUserHolding(holding ? holding.quantity : 0);
        }
      } catch (err) {
        console.error('Failed to load portfolio stats:', err);
      }
    }
    loadPortfolio();
  }, [asset]);

  const handleQuickQty = (amount) => {
    setQuantity(String(amount));
  };

  const handleMaxQty = () => {
    if (tradeType === 'BUY') {
      const maxPossible = Math.floor(userCash / executionPrice);
      setQuantity(String(Math.max(maxPossible, 1)));
    } else {
      setQuantity(String(userHolding));
    }
  };

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (qtyNum <= 0) {
      setErrorMessage('Please enter a valid quantity greater than 0.');
      return;
    }

    if (tradeType === 'BUY' && totalCost > userCash) {
      setErrorMessage(`Insufficient balance. You need ₹${totalCost.toLocaleString('en-IN')}`);
      return;
    }

    if (tradeType === 'SELL' && qtyNum > userHolding) {
      setErrorMessage(`You only own ${userHolding} shares of ${asset.symbol}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.executeTrade({
        symbol: asset.symbol,
        type: tradeType,
        quantity: qtyNum,
        orderType,
        limitPrice: orderType === 'LIMIT' ? executionPrice : null,
      });

      if (res && res.success) {
        setStatusMessage(res.message);
        window.dispatchEvent(new Event('portfolio-updated'));
        if (onSuccess) onSuccess();
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Trade execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>{asset.name}</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {asset.symbol} • Live ₹{currentPrice.toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Buy / Sell Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setTradeType('BUY');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              tradeType === 'BUY'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => {
              setTradeType('SELL');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              tradeType === 'SELL'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SELL
          </button>
        </div>

        {/* Order Details Form */}
        <form onSubmit={handleExecuteTrade} className="space-y-4">
          {/* Order Type Toggle */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Order Type</span>
            <div className="flex space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  orderType === 'MARKET' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Market
              </button>
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  orderType === 'LIMIT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Limit
              </button>
            </div>
          </div>

          {/* Limit Price Input if Limit Order */}
          {orderType === 'LIMIT' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Limit Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-300">Quantity</label>
              <span className="text-slate-400 text-[11px]">
                {tradeType === 'BUY'
                  ? `Available Cash: ₹${userCash.toLocaleString('en-IN')}`
                  : `Owned: ${userHolding} Units`}
              </span>
            </div>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:border-blue-500 focus:outline-none"
            />
            {/* Quick Qty Buttons */}
            <div className="flex space-x-1.5 pt-1">
              {[5, 10, 25, 50].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickQty(amt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  +{amt}
                </button>
              ))}
              <button
                type="button"
                onClick={handleMaxQty}
                className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 text-[11px] font-bold hover:bg-blue-600/30 transition ml-auto"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Price per unit</span>
              <span className="text-white font-medium">₹{executionPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Total Value</span>
              <span className="text-white font-bold text-sm">
                ₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle size={15} />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !!statusMessage}
            className={`w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 ${
              tradeType === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
            }`}
          >
            {tradeType === 'BUY' ? <ShoppingCart size={16} /> : <TrendingDown size={16} />}
            <span>
              {loading
                ? 'Executing Order...'
                : `${tradeType === 'BUY' ? 'Buy' : 'Sell'} ${qtyNum || 0} ${asset.symbol}`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
