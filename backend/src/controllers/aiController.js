import { aiService } from '../services/aiService.js';

export const aiController = {
  async getRecommendations(req, res) {
    try {
      const data = await aiService.getRecommendations();
      return res.json({ success: true, ...data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async analyzeStock(req, res) {
    try {
      const { symbol } = req.params;
      const data = await aiService.analyzeStock(symbol);
      return res.json({ success: true, ...data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
