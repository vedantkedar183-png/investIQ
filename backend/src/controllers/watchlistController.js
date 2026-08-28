import { watchlistService } from '../services/watchlistService.js';

export const watchlistController = {
  async getWatchlist(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-1';
      const watchlist = await watchlistService.getWatchlist(userId);
      return res.json({ success: true, ...watchlist });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async toggle(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-1';
      const { symbol } = req.body;
      if (!symbol) {
        return res.status(400).json({ error: 'Symbol is required' });
      }

      const result = await watchlistService.toggleWatchlist(userId, symbol);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
