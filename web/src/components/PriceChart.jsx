'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';

const TIMEFRAMES = ['1D', '1W', '1M', '1Y', '5Y', 'ALL'];

export default function PriceChart({ symbol, defaultPrice = 1000 }) {
  const [timeframe, setTimeframe] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getHistoricalChart(symbol, timeframe);
        if (isMounted && res && res.points) {
          setChartData(res.points);
          setHoveredPoint(null);
        }
      } catch (err) {
        console.error('Error loading chart points:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [symbol, timeframe]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        Loading chart data for {symbol}...
      </div>
    );
  }

  const prices = chartData.map((d) => d.close || d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const isUp = lastPrice >= firstPrice;
  const strokeColor = isUp ? '#10B981' : '#EF4444';
  const fillColor = isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  const activePoint = hoveredPoint || chartData[chartData.length - 1];
  const activePrice = activePoint ? (activePoint.close || activePoint.price) : lastPrice;
  const changeFromStart = activePrice - firstPrice;
  const changePercent = firstPrice > 0 ? (changeFromStart / firstPrice) * 100 : 0;

  // Generate SVG path coordinates
  const svgWidth = 700;
  const svgHeight = 260;
  const paddingX = 10;
  const paddingY = 20;

  const getX = (idx) => paddingX + (idx / (chartData.length - 1)) * (svgWidth - paddingX * 2);
  const getY = (price) =>
    svgHeight - paddingY - ((price - minPrice) / priceRange) * (svgHeight - paddingY * 2);

  const pointsString = chartData.map((d, i) => `${getX(i)},${getY(d.close || d.price)}`).join(' ');
  const areaPath = `M ${getX(0)},${svgHeight} L ${pointsString} L ${getX(chartData.length - 1)},${svgHeight} Z`;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline space-x-3">
            <h2 className="text-3xl font-extrabold text-white">
              ₹{activePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </h2>
            <span
              className={`text-sm font-bold flex items-center ${
                changeFromStart >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {changeFromStart >= 0 ? '+' : ''}₹{changeFromStart.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {activePoint?.fullDate ? new Date(activePoint.fullDate).toLocaleString('en-IN') : 'Live Market Price'}
          </p>
        </div>

        {/* Timeframe selector pills */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full h-64 select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={paddingY} x2={svgWidth} y2={paddingY} stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="0" y1={svgHeight - paddingY} x2={svgWidth} y2={svgHeight - paddingY} stroke="#1e293b" strokeDasharray="4 4" />

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#gradient-${symbol})`} />

          {/* Price Line */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Interactive touch/hover points */}
          {chartData.map((d, idx) => {
            const cx = getX(idx);
            const cy = getY(d.close || d.price);
            const isHovered = hoveredPoint === d;

            return (
              <g key={idx} onMouseEnter={() => setHoveredPoint(d)}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 3}
                  fill={isHovered ? '#ffffff' : strokeColor}
                  stroke={isHovered ? strokeColor : 'none'}
                  strokeWidth="2"
                  className="transition-all cursor-pointer opacity-0 hover:opacity-100"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer labels */}
      <div className="flex justify-between text-[11px] text-slate-500 font-medium px-2">
        <span>{chartData[0]?.time}</span>
        <span>{chartData[Math.floor(chartData.length / 2)]?.time}</span>
        <span>{chartData[chartData.length - 1]?.time}</span>
      </div>
    </div>
  );
}
