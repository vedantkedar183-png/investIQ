'use client';

import React, { useState, useEffect } from 'react';
import { FileText, ArrowDownRight, ArrowUpRight, Filter, Search, Calculator, Download, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import SIPCalculatorWidget from '../../components/SIPCalculatorWidget';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedType !== 'ALL') params.type = selectedType;
      if (searchSymbol.trim()) params.symbol = searchSymbol.trim();

      const res = await api.getTransactions(params);
      if (res && res.transactions) {
        setTransactions(res.transactions);
      }
    } catch (err) {
      console.error('Error loading transaction reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedType, searchSymbol]);

  const totalVolume = transactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-2">
        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/20 inline-block">
          REPORTS & TRANSACTION LOGS
        </span>
        <h2 className="text-2xl font-black text-white">Financial Activity & Calculation Reports</h2>
        <p className="text-xs md:text-sm text-slate-400">
          Review your simulated trade executions, order histories, and wealth planning models.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Orders Logged</span>
          <h3 className="text-2xl font-black text-white">{transactions.length}</h3>
          <p className="text-[11px] text-slate-500">Across Stocks & Mutual Funds</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Simulated Volume</span>
          <h3 className="text-2xl font-black text-white">₹{totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
          <p className="text-[11px] text-slate-500">Cumulative order turnover</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Execution Status</span>
          <h3 className="text-2xl font-black text-emerald-400">100% Filled</h3>
          <p className="text-[11px] text-slate-500">Instant paper execution</p>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Order Execution Ledger</h3>
            <p className="text-xs text-slate-400">Audit trail of all executed buys and sells</p>
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Filter by symbol..."
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              {['ALL', 'BUY', 'SELL'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading transactions...</div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">Date & Time</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Asset</th>
                  <th className="pb-3 px-3">Quantity</th>
                  <th className="pb-3 px-3">Execution Price</th>
                  <th className="pb-3 px-3 text-right">Total Amount</th>
                  <th className="pb-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => {
                  const isBuy = tx.type === 'BUY';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-3 text-slate-400">
                        {new Date(tx.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            isBuy
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{tx.assetName || tx.assetSymbol}</div>
                        <div className="text-[11px] text-slate-500">{tx.assetSymbol}</div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-200">{tx.quantity}</td>
                      <td className="py-3.5 px-3 text-slate-300">₹{tx.price?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3 font-bold text-white text-right">
                        ₹{tx.totalAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="text-emerald-400 font-semibold text-[11px] flex items-center justify-end space-x-1">
                          <CheckCircle size={12} />
                          <span>Executed</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No transactions found matching your criteria.
          </div>
        )}
      </div>

      {/* Embedded Calculators */}
      <SIPCalculatorWidget />
    </div>
  );
}
