import { marketService } from '../services/marketService.js';
import { get52WeekRatio } from '@investiq/shared';

export const marketController = {
  async getIndices(req, res) {
    try {
      const indices = await marketService.getIndices();
      return res.json({ success: true, indices });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async search(req, res) {
    try {
      const { q, type, risk, minReturn, category, sort } = req.query;
      const results = await marketService.searchAssets({
        query: q,
        type,
        risk,
        minReturn,
        category,
        sort,
      });

      const enriched = results.map((asset) => {
        if (asset.type === 'STOCK' && asset.low52Week && asset.high52Week) {
          return {
            ...asset,
            ratio52Week: get52WeekRatio(asset.currentPrice, asset.low52Week, asset.high52Week),
          };
        }
        return asset;
      });

      return res.json({
        success: true,
        count: enriched.length,
        results: enriched,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async getAssetDetails(req, res) {
    try {
      const { symbol } = req.params;
      const asset = await marketService.getAssetBySymbol(symbol);
      if (!asset) {
        return res.status(404).json({ error: `Asset ${symbol} not found in market registry.` });
      }

      let ratio52Week = null;
      if (asset.type === 'STOCK' && asset.low52Week && asset.high52Week) {
        ratio52Week = get52WeekRatio(asset.currentPrice, asset.low52Week, asset.high52Week);
      }

      return res.json({
        success: true,
        asset: {
          ...asset,
          ratio52Week,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async getHistoricalChart(req, res) {
    try {
      const { symbol } = req.params;
      const { timeframe = '1M' } = req.query;
      const chartData = await marketService.getHistoricalData(symbol, timeframe);
      return res.json({
        success: true,
        ...chartData,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};
