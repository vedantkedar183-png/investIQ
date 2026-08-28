import { portfolioService } from '../services/portfolioService.js';

export const portfolioController = {
  async getSummary(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-1';
      const summary = await portfolioService.getPortfolioSummary(userId);
      return res.json({ success: true, ...summary });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async trade(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-1';
      const { symbol, type, quantity, orderType, limitPrice } = req.body;

      if (!symbol || !type || !quantity) {
        return res.status(400).json({ error: 'Symbol, type (BUY/SELL), and quantity are required' });
      }

      const result = await portfolioService.executeTrade({
        userId,
        symbol,
        type,
        quantity,
        orderType,
        limitPrice,
      });

      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async topupCash(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-1';
      const { amount } = req.body;
      const result = await portfolioService.depositCash(userId, amount);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
