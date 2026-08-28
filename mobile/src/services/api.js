const API_BASE = 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    return await res.json();
  } catch (err) {
    console.error(`Mobile API error on ${endpoint}:`, err);
    throw err;
  }
}

export const mobileApi = {
  getIndices: () => request('/market/indices'),
  searchAssets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/market/search?${query}`);
  },
  getAssetDetails: (symbol) => request(`/market/asset/${symbol}`),
  getHistoricalChart: (symbol, timeframe = '1M') => request(`/market/history/${symbol}?timeframe=${timeframe}`),
  getPortfolioSummary: () => request('/portfolio/summary'),
  executeTrade: (payload) =>
    request('/portfolio/trade', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getWatchlist: () => request('/watchlist'),
  toggleWatchlist: (symbol) =>
    request('/watchlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    }),
  getAIRecommendations: () => request('/ai/recommendations'),
};
