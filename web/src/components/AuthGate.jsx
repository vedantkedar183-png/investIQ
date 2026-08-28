'use client';

import React, { useState } from 'react';
import { Lock, Mail, User, Sparkles, ArrowRight, Shield, AlertCircle, Gift, TrendingUp, BarChart3, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthGate({ children }) {
  const { isAuthenticated, loading, login, register, guestLogin } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [riskProfile, setRiskProfile] = useState('MODERATE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // While checking localStorage token validity, show loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090D16]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Loading investIQ...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the app
  if (isAuthenticated) {
    return children;
  }

  // Otherwise — force login/register screen
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register({ email, name, password, riskProfile });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await guestLogin();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col lg:flex-row">
      {/* Left Panel — Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-950 via-[#0c1425] to-indigo-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              invest<span className="text-blue-400">IQ</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Smart Investment OS</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white leading-tight">
              Your AI-Powered<br />Investment Intelligence<br />Platform
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Track live stocks, simulate trades, analyze markets with Google Gemini AI,
              and build your portfolio — all in one place.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {[
              { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Live Market Data', desc: 'Real-time prices for NSE, BSE, NASDAQ & NYSE' },
              { icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-400/10', label: 'AI News Sentiment', desc: 'Google Gemini analyzes market news in real-time' },
              { icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Paper Trading', desc: 'Practice with ₹1,00,000 virtual cash, zero risk' },
            ].map((feature) => (
              <div key={feature.label} className="flex items-start space-x-3">
                <div className={`p-2.5 rounded-xl ${feature.bg}`}>
                  <feature.icon size={20} className={feature.color} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{feature.label}</p>
                  <p className="text-xs text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500 pt-8">
          © 2026 investIQ. Powered by Neon, Gemini AI & Yahoo Finance.
        </p>
      </div>

      {/* Right Panel — Login / Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-4">
            <h1 className="text-3xl font-black text-white tracking-tight">
              invest<span className="text-blue-400">IQ</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">Smart Investment OS</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
                <Sparkles size={15} />
                <span>INVESTIQ ACCESS</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                {tab === 'login' ? 'Sign in to your Account' : 'Create Investor Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {tab === 'login'
                  ? 'Access your portfolio, live markets, and AI insights.'
                  : 'Get ₹1,00,000 in virtual funds credited instantly.'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                className={`py-2 text-xs font-bold rounded-xl transition ${
                  tab === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(null); }}
                className={`py-2 text-xs font-bold rounded-xl transition ${
                  tab === 'register' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {tab === 'register' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Risk Profile</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRiskProfile(r)}
                          className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                            riskProfile === r
                              ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                    <Gift size={15} />
                    <span>Bonus: ₹1,00,000 in virtual funds credited instantly!</span>
                  </div>
                </>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Authenticating...' : tab === 'login' ? 'Sign In' : 'Create Investor Account'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-semibold absolute">
                Or try instantly
              </span>
            </div>

            {/* 1-Click Demo Login */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Shield size={14} className="text-emerald-400" />
              <span>1-Click Demo Investor Login (₹1,25,000 Portfolio)</span>
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-500">
            By signing in you agree to our Terms of Service. This is a simulated trading platform.
          </p>
        </div>
      </div>
    </div>
  );
}
