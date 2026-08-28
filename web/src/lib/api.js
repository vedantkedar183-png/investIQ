const PRODUCTION_API = 'https://investiq-vigz.onrender.com/api/v1';

function resolveApiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  const isBrowser = typeof window !== 'undefined';
  const host = isBrowser ? window.location.hostname : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  let base = fromEnv || (isBrowser && !isLocal ? PRODUCTION_API : 'http://localhost:5000/api/v1');
  base = base.replace(/\/+$/, '');
  if (!base.endsWith('/api/v1')) {
    base += '/api/v1';
  }
  return base;
}

let API_BASE = resolveApiBase();

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('investiq_token') : null;
  const { optional, timeoutMs = 25000, ...fetchOptions } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined' && !optional) {
        localStorage.removeItem('investiq_token');
        window.dispatchEvent(new Event('investiq-unauthorized'));
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    const message = error.name === 'AbortError' ? `Request timed out on ${endpoint}` : error.message;
    console.error(`API error on ${endpoint}:`, message);
    throw new Error(message);
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  // Auth & Profile
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  guestLogin: () =>
    request('/auth/guest-login', {
      method: 'POST',
    }),
  getProfile: () => request('/auth/profile'),

  // Market
  getIndices: () => request('/market/indices'),
  searchAssets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/market/search?${query}`);
  },
  getAssetDetails: (symbol) => request(`/market/asset/${symbol}`),
  getHistoricalChart: (symbol, timeframe = '1M') => request(`/market/history/${symbol}?timeframe=${timeframe}`),

  // Portfolio
  getPortfolioSummary: () => request('/portfolio/summary'),
  executeTrade: (payload) =>
    request('/portfolio/trade', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  topupCash: (amount) =>
    request('/portfolio/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  // Watchlist
  getWatchlist: () => request('/watchlist', { optional: true }),
  toggleWatchlist: (symbol) =>
    request('/watchlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    }),

  // AI Insights
  getAIRecommendations: () => request('/ai/recommendations'),
  analyzeStock: (symbol) => request(`/ai/analyze/${symbol}`),

  // Reports & Calculators
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports/transactions?${query}`);
  },
  calculateSIP: (params) =>
    request('/reports/calculate/sip', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  calculateLumpsum: (params) =>
    request('/reports/calculate/lumpsum', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};
