'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Wallet, PlusCircle, Sparkles, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [cashBalance, setCashBalance] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50000');
  const [isDepositing, setIsDepositing] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    if (user && user.cashBalance !== undefined) {
      setCashBalance(user.cashBalance);
    }
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setIsDepositing(true);
    try {
      const res = await api.topupCash(Number(depositAmount));
      if (res && res.cashBalance !== undefined) {
        setCashBalance(res.cashBalance);
        window.dispatchEvent(new Event('portfolio-updated'));
        setShowDeposit(false);
      }
    } catch (err) {
      alert('Error depositing funds: ' + err.message);
    } finally {
      setIsDepositing(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'IQ';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <header className="h-16 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-96 max-w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search Stocks (RELIANCE, NVDA), Mutual Funds, FDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </form>

        {/* Right Navigation */}
        <div className="flex items-center space-x-3">
          {/* AI Insights Button */}
          <Link
            href="/ai-insights"
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition"
          >
            <Sparkles size={14} />
            <span>AI News Signals</span>
          </Link>

          {/* Cash Balance Pill */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 pl-3 space-x-2">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Wallet size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Cash:</span>
              <span className="text-white font-bold">
                ₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={() => setShowDeposit(true)}
              className="p-1 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold flex items-center space-x-1 transition"
              title="Add Virtual Cash"
            >
              <PlusCircle size={13} />
              <span>Add</span>
            </button>
          </div>

          {/* User Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center space-x-2 p-1.5 pr-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block text-xs">
                <p className="font-semibold text-white leading-tight truncate max-w-[100px]">{user?.name || 'Investor'}</p>
                <p className="text-[10px] text-slate-400">{user?.riskProfile || 'PRO'}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {userDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl space-y-1 z-50">
                <Link
                  href="/profile"
                  onClick={() => setUserDropdown(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <User size={15} className="text-blue-400" />
                  <span>Profile & Settings</span>
                </Link>
                <button
                  onClick={() => {
                    setUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition text-left"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Deposit Cash Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Wallet className="text-emerald-400" size={20} />
                <span>Add Virtual Cash</span>
              </h3>
              <button
                onClick={() => setShowDeposit(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Top up your simulated virtual trading balance to practice buying stocks, mutual funds, and options risk-free.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Select or Enter Amount (₹)</label>
              <div className="grid grid-cols-3 gap-2">
                {['25000', '50000', '100000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      depositAmount === amt
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    + ₹{Number(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full mt-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Custom Amount"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeposit(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddFunds}
                disabled={isDepositing}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
              >
                {isDepositing ? 'Adding...' : 'Deposit Cash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
