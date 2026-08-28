import { reportService } from '../services/reportService.js';

export const reportController = {
  async getTransactions(req, res) {
    try {
      const userId = req.user?.id || 'demo-user-1';
      const { type, symbol, limit } = req.query;
      const data = await reportService.getTransactions(userId, { type, symbol, limit });
      return res.json({ success: true, ...data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  calculateSIP(req, res) {
    try {
      const { monthlyInvestment, annualRate, tenureYears } = req.body;
      const result = reportService.calculateSIP({
        monthlyInvestment: Number(monthlyInvestment) || 5000,
        annualRate: Number(annualRate) || 12,
        tenureYears: Number(tenureYears) || 10,
      });
      return res.json({ success: true, ...result });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  calculateLumpsum(req, res) {
    try {
      const { investmentAmount, annualRate, tenureYears } = req.body;
      const result = reportService.calculateLumpsum({
        investmentAmount: Number(investmentAmount) || 100000,
        annualRate: Number(annualRate) || 12,
        tenureYears: Number(tenureYears) || 5,
      });
      return res.json({ success: true, ...result });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },
};
