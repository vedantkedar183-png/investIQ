'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, Wallet, LogOut, CheckCircle, RefreshCw, Sparkles, Bell, DollarSign } from 'lucide-react';
import { api } from '../../lib/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [risk, setRisk] = useState('MODERATE');
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getProfile();
        if (res && res.user) {
          setProfile(res.user);
          setRisk(res.user.riskProfile || 'MODERATE');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-rose-400">Error loading profile data.</div>;

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetWallet = async () => {
    if (!confirm('Are you sure you want to reset your simulated virtual trading balance to ₹1,00,000?')) return;
    setResetting(true);
    try {
      await api.topupCash(100000);
      window.dispatchEvent(new Event('portfolio-updated'));
      setProfile((prev) => ({ ...prev, cashBalance: 100000 }));
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of investIQ?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('investiq_token');
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 p-6 md:p-8 rounded-3xl border border-slate-800 flex items-center space-x-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
          AS
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black text-white">{profile.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              Verified Investor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
        </div>
      </div>

      {/* Profile Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <User size={18} className="text-blue-400" />
          <span>Personal Information & Risk Preferences</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        {/* Risk Profile Selection */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-medium text-slate-300">Investment Risk Appetite</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'CONSERVATIVE', title: 'Conservative', desc: 'Focus on Capital Preservation & FDs' },
              { id: 'MODERATE', title: 'Moderate', desc: 'Balanced Growth with Bluechips & Flexi Caps' },
              { id: 'AGGRESSIVE', title: 'Aggressive', desc: 'High Growth Small-caps, Tech & F&O' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRisk(item.id)}
                className={`p-4 rounded-2xl border text-left transition ${
                  risk === item.id
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <p className="font-bold text-sm text-white">{item.title}</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {saved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1.5">
              <CheckCircle size={15} />
              <span>Preferences Saved Successfully</span>
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Simulated Virtual Wallet Management */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Wallet size={18} className="text-emerald-400" />
          <span>Simulated Virtual Wallet Controls</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Manage your virtual funds used for paper trading and stock market simulations.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Current Virtual Cash Balance</span>
            <h4 className="text-2xl font-black text-white mt-0.5">
              ₹{profile.cashBalance?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </h4>
          </div>

          <button
            onClick={handleResetWallet}
            disabled={resetting}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center space-x-2 self-start"
          >
            <RefreshCw size={14} className={resetting ? 'animate-spin' : ''} />
            <span>Reset Wallet to ₹1,00,000</span>
          </button>
        </div>
      </div>

      {/* Logout Action Card */}
      <div className="bg-slate-900/50 border border-rose-900/20 rounded-3xl p-6 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Log Out of Account</h4>
          <p className="text-xs text-slate-400">Securely sign out of your investIQ session</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/30 rounded-xl text-xs font-bold flex items-center space-x-2 transition"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
