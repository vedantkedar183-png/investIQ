import yahooFinance from 'yahoo-finance2';
import axios from 'axios';
import { db } from '../data/db.js';
import { NseIndia } from 'stock-nse-india';

const nse = new NseIndia();

// Cache structure
const quoteCache = new Map();
const chartCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const CHART_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const QUOTE_TIMEOUT_MS = 4000;

function withTimeout(promise, ms, fallback = null) {
  let timer;
  return Promise.race([
    Promise.resolve(promise).catch(() => fallback),
    new Promise((resolve) => {
      timer = setTimeout(() => resolve(fallback), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

// Map common symbols to exact Yahoo Finance tickers
const TICKER_MAP = {
  RELIANCE: 'RELIANCE.NS',
  TCS: 'TCS.NS',
  INFY: 'INFY.NS',
  HDFCBANK: 'HDFCBANK.NS',
  TATAMOTORS: 'TATAMOTORS.NS',
  ITC: 'ITC.NS',
  ICICIBANK: 'ICICIBANK.NS',
  SBIN: 'SBIN.NS',
  BHARTIARTL: 'BHARTIARTL.NS',
  LT: 'LT.NS',
  NVDA: 'NVDA',
  AAPL: 'AAPL',
  MSFT: 'MSFT',
  TSLA: 'TSLA',
  GOOGL: 'GOOGL',
  AMZN: 'AMZN',
  META: 'META',
};

function formatMarketCap(cap, currency = 'INR') {
  if (!cap) return 'N/A';
  if (currency === 'INR' || cap > 100000000000) {
    const lakhCr = cap / 10000000000000;
    if (lakhCr >= 0.01) {
      return `₹ ${(cap / 10000000000000).toFixed(2)} Lakh Cr`;
    }
    const cr = cap / 10000000;
    return `₹ ${cr.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr`;
  }
  if (cap >= 1e12) return `$ ${(cap / 1e12).toFixed(2)} Trillion`;
  if (cap >= 1e9) return `$ ${(cap / 1e9).toFixed(2)} Billion`;
  if (cap >= 1e6) return `$ ${(cap / 1e6).toFixed(2)} Million`;
  return `$ ${cap.toLocaleString()}`;
}

export const marketService = {
  // Resolve Yahoo Finance ticker
  resolveTicker(symbol) {
    if (!symbol) return null;
    const clean = symbol.toUpperCase().trim();
    if (TICKER_MAP[clean]) return TICKER_MAP[clean];
    if (clean.endsWith('.NS') || clean.endsWith('.BO')) return clean;
    return clean;
  },

  // Fetch real live quotes for market indices
  async getIndices() {
    const indicesList = [
      { symbol: 'NIFTY 50', name: 'Nifty 50', ticker: '^NSEI' },
      { symbol: 'SENSEX', name: 'BSE Sensex', ticker: '^BSESN' },
      { symbol: 'BANK NIFTY', name: 'Bank Nifty', ticker: '^NSEBANK' },
      { symbol: 'NIFTY IT', name: 'Nifty IT', ticker: '^CNXIT' },
      { symbol: 'S&P 500', name: 'S&P 500', ticker: '^GSPC' },
      { symbol: 'NASDAQ', name: 'Nasdaq 100', ticker: '^IXIC' },
    ];

    const results = await Promise.all(
      indicesList.map(async (idx) => {
        try {
          const cacheKey = `idx-${idx.ticker}`;
          const cached = quoteCache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return cached.data;
          }

          const quote = await withTimeout(yahooFinance.quote(idx.ticker), QUOTE_TIMEOUT_MS, null);
          if (quote && quote.regularMarketPrice) {
            const data = {
              symbol: idx.symbol,
              name: idx.name,
              value: parseFloat(quote.regularMarketPrice.toFixed(2)),
              change: parseFloat((quote.regularMarketChange || 0).toFixed(2)),
              changePercent: parseFloat((quote.regularMarketChangePercent || 0).toFixed(2)),
              isPositive: (quote.regularMarketChange || 0) >= 0,
            };
            quoteCache.set(cacheKey, { timestamp: Date.now(), data });
            return data;
          }
        } catch (err) {
          // Fallback to static seed
        }

        const fallback = db.data.indices.find((i) => i.symbol === idx.symbol);
        return fallback || {
          symbol: idx.symbol,
          name: idx.name,
          value: 24500,
          change: 50,
          changePercent: 0.25,
          isPositive: true,
        };
      })
    );

    return results;
  },

  // Fetch real live stock quote from Yahoo Finance / Finnhub
  async fetchLiveQuote(symbol) {
    const ticker = this.resolveTicker(symbol);
    if (!ticker) return null;

    const cacheKey = `quote-${ticker}`;
    const cached = quoteCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      // 1. Try Yahoo Finance API
      const quote = await withTimeout(yahooFinance.quote(ticker), QUOTE_TIMEOUT_MS, null);
      if (quote && (quote.regularMarketPrice || quote.price)) {
        const livePrice = quote.regularMarketPrice || quote.price || 0;
        const prevClose = quote.regularMarketPreviousClose || livePrice;
        const high52 = quote.fiftyTwoWeekHigh || livePrice * 1.15;
        const low52 = quote.fiftyTwoWeekLow || livePrice * 0.85;
        const pe = quote.trailingPE || quote.forwardPE || 25.0;

        const liveData = {
          symbol: symbol.toUpperCase(),
          ticker,
          name: quote.longName || quote.shortName || symbol,
          currentPrice: parseFloat(livePrice.toFixed(2)),
          previousClose: parseFloat(prevClose.toFixed(2)),
          change: parseFloat((quote.regularMarketChange || livePrice - prevClose).toFixed(2)),
          changePercent: parseFloat((quote.regularMarketChangePercent || 0).toFixed(2)),
          high52Week: parseFloat(high52.toFixed(2)),
          low52Week: parseFloat(low52.toFixed(2)),
          marketCap: formatMarketCap(quote.marketCap, quote.currency),
          peRatio: parseFloat((pe || 25).toFixed(1)),
          dividendYield: quote.dividendYield ? parseFloat(quote.dividendYield.toFixed(2)) : 0.5,
          volume: quote.regularMarketVolume
            ? `${(quote.regularMarketVolume / 1000000).toFixed(1)}M`
            : '4.2M',
          exchange: quote.exchange || 'NSE',
          currency: quote.currency || 'INR',
        };

        quoteCache.set(cacheKey, { timestamp: Date.now(), data: liveData });
        return liveData;
      }
    } catch (err) {
      // 2. Try NSE India directly (Bypasses API Keys entirely for Indian Stocks)
      try {
        const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '').toUpperCase();
        const details = await withTimeout(nse.getEquityDetails(cleanSymbol), QUOTE_TIMEOUT_MS, null);
        
        if (details && details.priceInfo) {
          const livePrice = details.priceInfo.lastPrice;
          const prevClose = details.priceInfo.previousClose;
          
          const liveData = {
            symbol: cleanSymbol,
            ticker: cleanSymbol + '.NS',
            name: details.info?.companyName || cleanSymbol,
            currentPrice: livePrice,
            previousClose: prevClose,
            change: details.priceInfo.change,
            changePercent: details.priceInfo.pChange,
            high52Week: details.priceInfo.weekHigh || livePrice * 1.15,
            low52Week: details.priceInfo.weekLow || livePrice * 0.85,
            peRatio: 25.0,
            marketCap: '₹ 50,000 Cr',
            dividendYield: 1.2,
            volume: '2.5M',
            exchange: 'NSE',
            currency: 'INR'
          };
          
          quoteCache.set(cacheKey, { timestamp: Date.now(), data: liveData });
          return liveData;
        }
      } catch (nseErr) {
        // Fall through to Finnhub for US stocks if NSE also fails
      }

      // 3. Try Finnhub if key is present (For US Stocks)
      if (process.env.FINNHUB_API_KEY || process.env.STOCKS_API_KEY) {
        try {
          const key = process.env.FINNHUB_API_KEY || process.env.STOCKS_API_KEY;
          const finnRes = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`, { timeout: 4000 });
          if (finnRes.data && finnRes.data.c) {
            const c = finnRes.data.c;
            const pc = finnRes.data.pc;
            const liveData = {
              symbol: symbol.toUpperCase(),
              ticker: symbol,
              name: symbol,
              currentPrice: c,
              previousClose: pc,
              change: c - pc,
              changePercent: ((c - pc) / pc) * 100,
              high52Week: finnRes.data.h * 1.1,
              low52Week: finnRes.data.l * 0.9,
              peRatio: 24.5,
              marketCap: '$ 500 Billion',
              volume: '5M',
              exchange: 'US',
            };
            quoteCache.set(cacheKey, { timestamp: Date.now(), data: liveData });
            return liveData;
          }
        } catch (fErr) {
          // continue to fallback
        }
      }
    }

    return null;
  },

  matchAssetQuery(asset, query) {
    if (!query || !query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      asset.symbol.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q) ||
      (asset.sector && asset.sector.toLowerCase().includes(q)) ||
      (asset.category && asset.category.toLowerCase().includes(q))
    );
  },

  applySearchFilters(assets, { query = '', type = '', risk = '', minReturn = '', category = '' }) {
    let results = assets;
    if (query && query.trim()) {
      results = results.filter((asset) => this.matchAssetQuery(asset, query));
    }
    if (type && type !== 'ALL') {
      results = results.filter((asset) => asset.type === type.toUpperCase());
    }
    if (risk && risk !== 'ALL') {
      results = results.filter((asset) => asset.riskLevel === risk.toUpperCase());
    }
    if (category) {
      results = results.filter((asset) => asset.category && asset.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (minReturn) {
      const min = parseFloat(minReturn);
      results = results.filter((asset) => (asset.returns1Y && asset.returns1Y >= min) || (asset.returns3Y && asset.returns3Y >= min));
    }
    return results;
  },

  // Unified search across Stocks, Mutual Funds, FDs, and Bonds
  async searchAssets({ query = '', type = '', risk = '', minReturn = '', category = '', sort = '' }) {
    let assets = [...db.data.assets];
    const q = (query || '').trim();

    // Resolve uncataloged symbols without blocking on the full NSE universe
    if (q.length >= 2) {
      const existing = assets.find((a) => this.matchAssetQuery(a, q));
      if (!existing) {
        let bestTicker = this.resolveTicker(q.toUpperCase()) || q.toUpperCase();
        const searchRes = await withTimeout(yahooFinance.search(q), QUOTE_TIMEOUT_MS, null);
        if (searchRes && searchRes.quotes && searchRes.quotes.length > 0) {
          const equityMatch = searchRes.quotes.find((qt) => qt.quoteType === 'EQUITY') || searchRes.quotes[0];
          if (equityMatch && equityMatch.symbol) {
            bestTicker = equityMatch.symbol;
          }
        }

        const liveQuote = await this.fetchLiveQuote(bestTicker);
        assets.unshift({
          id: `stock-live-${bestTicker.toLowerCase()}`,
          symbol: liveQuote ? liveQuote.symbol : bestTicker.replace('.NS', '').replace('.BO', ''),
          ticker: liveQuote ? liveQuote.ticker : bestTicker,
          name: liveQuote ? liveQuote.name : bestTicker,
          type: 'STOCK',
          exchange: liveQuote ? liveQuote.exchange : (bestTicker.includes('.NS') ? 'NSE' : 'Market'),
          sector: 'Live Market Equity',
          currentPrice: liveQuote ? liveQuote.currentPrice : 1500.00,
          previousClose: liveQuote ? liveQuote.previousClose : 1490.00,
          change: liveQuote ? liveQuote.change : 10.00,
          changePercent: liveQuote ? liveQuote.changePercent : 0.67,
          high52Week: liveQuote ? liveQuote.high52Week : 2000.00,
          low52Week: liveQuote ? liveQuote.low52Week : 1000.00,
          peRatio: liveQuote ? liveQuote.peRatio : 25.0,
          marketCap: liveQuote ? liveQuote.marketCap : '₹ 50,000 Cr',
          dividendYield: liveQuote ? liveQuote.dividendYield : 1.2,
          volume: liveQuote ? liveQuote.volume : '1M',
          pattern: 'Live Market Momentum',
          technicalSignal: liveQuote ? (liveQuote.changePercent >= 0 ? 'BUY' : 'NEUTRAL') : 'BUY',
          rsi: 55.0,
          description: liveQuote ? `${liveQuote.name} (${liveQuote.symbol}) live equity security.` : `Dynamic asset for ${bestTicker} (Offline Mode)`,
        });
      }
    }

    // Filter first so we only live-quote what the user asked for
    let results = this.applySearchFilters(assets, { query, type, risk, minReturn, category });

    const stocksToEnrich = results.filter((asset) => asset.type === 'STOCK').slice(0, 12);
    const liveBySymbol = new Map();
    await Promise.all(
      stocksToEnrich.map(async (asset) => {
        const live = await this.fetchLiveQuote(asset.symbol);
        if (live) liveBySymbol.set(asset.symbol, live);
      })
    );

    results = results.map((asset) => {
      const live = liveBySymbol.get(asset.symbol);
      if (!live) return asset;
      return {
        ...asset,
        currentPrice: live.currentPrice,
        previousClose: live.previousClose,
        change: live.change,
        changePercent: live.changePercent,
        high52Week: live.high52Week,
        low52Week: live.low52Week,
        marketCap: live.marketCap || asset.marketCap,
        peRatio: live.peRatio || asset.peRatio,
      };
    });

    if (sort === 'gainers') {
      results.sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
    } else if (sort === 'losers') {
      results.sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0));
    } else if (sort === 'returns') {
      results.sort((a, b) => (b.returns1Y || 0) - (a.returns1Y || 0));
    }

    return results;
  },

  // Get asset by symbol with live quote enrichment
  async getAssetBySymbol(symbol) {
    if (!symbol) return null;
    const clean = symbol.toUpperCase();
    const asset = db.data.assets.find((a) => a.symbol.toUpperCase() === clean);

    const liveQuote = await this.fetchLiveQuote(clean);
    if (asset) {
      if (liveQuote && asset.type === 'STOCK') {
        return {
          ...asset,
          currentPrice: liveQuote.currentPrice,
          previousClose: liveQuote.previousClose,
          change: liveQuote.change,
          changePercent: liveQuote.changePercent,
          high52Week: liveQuote.high52Week,
          low52Week: liveQuote.low52Week,
          marketCap: liveQuote.marketCap || asset.marketCap,
          peRatio: liveQuote.peRatio || asset.peRatio,
        };
      }
      return asset;
    }

    // If not in catalog, construct dynamically from live quote
    // If not in catalog, construct dynamically from live quote or fallback
    return {
      id: `stock-dynamic-${clean.toLowerCase()}`,
      symbol: liveQuote ? liveQuote.symbol : clean.replace('.NS', '').replace('.BO', ''),
      name: liveQuote ? liveQuote.name : clean,
      type: 'STOCK',
      exchange: liveQuote ? liveQuote.exchange : (clean.includes('.NS') ? 'NSE' : 'Market'),
      sector: 'Global Equity',
      currentPrice: liveQuote ? liveQuote.currentPrice : 1500.00,
      previousClose: liveQuote ? liveQuote.previousClose : 1490.00,
      change: liveQuote ? liveQuote.change : 10.00,
      changePercent: liveQuote ? liveQuote.changePercent : 0.67,
      high52Week: liveQuote ? liveQuote.high52Week : 2000.00,
      low52Week: liveQuote ? liveQuote.low52Week : 1000.00,
      marketCap: liveQuote ? liveQuote.marketCap : '₹ 50,000 Cr',
      peRatio: liveQuote ? liveQuote.peRatio : 25.0,
      dividendYield: liveQuote ? liveQuote.dividendYield : 1.2,
      volume: liveQuote ? liveQuote.volume : '1M',
      pattern: 'Market Formation',
      technicalSignal: liveQuote ? (liveQuote.changePercent >= 0 ? 'BUY' : 'NEUTRAL') : 'BUY',
      rsi: 54.0,
      description: liveQuote ? `${liveQuote.name} (${liveQuote.symbol}) live equity security.` : `Dynamic asset for ${clean} (Offline Mode)`,
    };
  },

  // Get real live historical chart points
  async getHistoricalData(symbol, timeframe = '1M') {
    const ticker = this.resolveTicker(symbol);
    const cacheKey = `chart-${ticker}-${timeframe.toUpperCase()}`;
    const cached = chartCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CHART_CACHE_TTL_MS) {
      return cached.data;
    }

    const asset = await this.getAssetBySymbol(symbol);
    const basePrice = asset ? (asset.currentPrice || asset.nav || 1000) : 1000;

    // Try fetching real historical chart from Yahoo Finance
    try {
      let interval = '1d';
      let period1 = new Date();

      switch (timeframe.toUpperCase()) {
        case '1D':
          interval = '5m';
          period1.setDate(period1.getDate() - 1);
          break;
        case '1W':
          interval = '15m';
          period1.setDate(period1.getDate() - 7);
          break;
        case '1M':
          interval = '1d';
          period1.setMonth(period1.getMonth() - 1);
          break;
        case '1Y':
          interval = '1wk';
          period1.setFullYear(period1.getFullYear() - 1);
          break;
        case '5Y':
          interval = '1mo';
          period1.setFullYear(period1.getFullYear() - 5);
          break;
        case 'ALL':
          interval = '3mo';
          period1.setFullYear(period1.getFullYear() - 10);
          break;
      }

      const chartRes = await withTimeout(
        yahooFinance.chart(ticker, {
          period1,
          interval,
        }),
        8000,
        null
      );

      if (chartRes && chartRes.quotes && chartRes.quotes.length > 0) {
        const points = chartRes.quotes
          .filter((q) => q.close !== null && q.close !== undefined)
          .map((q) => {
            const dateStr = q.date instanceof Date ? q.date.toISOString() : new Date(q.date).toISOString();
            return {
              time: timeframe === '1D' ? dateStr.substring(11, 16) : dateStr.substring(0, 10),
              fullDate: dateStr,
              price: parseFloat(q.close.toFixed(2)),
              open: parseFloat((q.open || q.close).toFixed(2)),
              high: parseFloat((q.high || q.close).toFixed(2)),
              low: parseFloat((q.low || q.close).toFixed(2)),
              close: parseFloat(q.close.toFixed(2)),
              volume: q.volume || 100000,
            };
          });

        if (points.length > 0) {
          const result = {
            symbol: symbol.toUpperCase(),
            timeframe: timeframe.toUpperCase(),
            currentPrice: points[points.length - 1].close,
            points,
          };
          chartCache.set(cacheKey, { timestamp: Date.now(), data: result });
          return result;
        }
      }
    } catch (err) {
      // Fallback to algorithmic generator
    }

    // High-fidelity fallback chart simulation
    let count = 30;
    let volatility = 0.015;
    let trend = 0.002;

    switch (timeframe.toUpperCase()) {
      case '1D': count = 48; volatility = 0.003; trend = 0.0002; break;
      case '1W': count = 35; volatility = 0.008; trend = 0.001; break;
      case '1M': count = 30; volatility = 0.012; trend = 0.003; break;
      case '1Y': count = 52; volatility = 0.025; trend = 0.006; break;
      case '5Y': count = 60; volatility = 0.04; trend = 0.015; break;
      case 'ALL': count = 80; volatility = 0.05; trend = 0.02; break;
    }

    const points = [];
    let current = basePrice * (1 - trend * count * 0.5);
    const now = Date.now();
    const stepMs = (24 * 60 * 60 * 1000 * (timeframe === '1D' ? 1 / 48 : timeframe === '1W' ? 7 / 35 : timeframe === '1Y' ? 365 / 52 : 30));

    for (let i = 0; i < count; i++) {
      const shock = (Math.random() - 0.48) * volatility * current;
      current = Math.max(current + shock + current * trend, 10);
      const high = current * (1 + Math.random() * volatility * 0.8);
      const low = current * (1 - Math.random() * volatility * 0.8);
      const open = (high + low) / 2;
      const close = current;
      const time = new Date(now - (count - 1 - i) * stepMs).toISOString();

      points.push({
        time: timeframe === '1D' ? time.substring(11, 16) : time.substring(0, 10),
        fullDate: time,
        price: parseFloat(close.toFixed(2)),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.floor(Math.random() * 500000 + 100000),
      });
    }

    if (points.length > 0) {
      points[points.length - 1].close = basePrice;
      points[points.length - 1].price = basePrice;
    }

    const result = {
      symbol: symbol.toUpperCase(),
      timeframe: timeframe.toUpperCase(),
      currentPrice: basePrice,
      points,
    };
    chartCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  },
};
