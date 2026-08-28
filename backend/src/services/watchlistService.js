import { db } from '../data/db.js';
import { marketService } from './marketService.js';

export const watchlistService = {
  // Get user watchlist with live enriched asset data
  async getWatchlist(userId = 'demo-user-1') {
    let user = await db.findUserById(userId);
    if (!user) user = await db.findUserByEmail('demo@investiq.com');
    const uId = user ? user.id : userId;

    const userWatchlist = await db.getUserWatchlist(uId);

    const items = await Promise.all(
      (userWatchlist.symbols || []).map(async (symbol) => {
        const catalog = db.data.assets.find((a) => a.symbol.toUpperCase() === String(symbol).toUpperCase());
        if (catalog) return catalog;
        return (await marketService.getAssetBySymbol(symbol)) || null;
      })
    );

    const validItems = items.filter(Boolean);

    return {
      id: userWatchlist.id,
      name: userWatchlist.name,
      count: validItems.length,
      items: validItems,
    };
  },

  // Toggle asset in watchlist (Add or Remove)
  async toggleWatchlist(userId = 'demo-user-1', symbol) {
    if (!symbol) throw new Error('Symbol is required');
    const sym = symbol.toUpperCase().trim();

    let user = await db.findUserById(userId);
    if (!user) user = await db.findUserByEmail('demo@investiq.com');
    const uId = user ? user.id : userId;

    const userWatchlist = await db.getUserWatchlist(uId);
    const index = (userWatchlist.symbols || []).indexOf(sym);
    let isAdded = false;

    if (index > -1) {
      userWatchlist.symbols.splice(index, 1);
      isAdded = false;
    } else {
      if (!userWatchlist.symbols) userWatchlist.symbols = [];
      userWatchlist.symbols.push(sym);
      isAdded = true;
    }

    await db.saveWatchlist(userWatchlist);

    const updated = await this.getWatchlist(uId);

    return {
      success: true,
      symbol: sym,
      isBookmarked: isAdded,
      message: isAdded ? `Added ${sym} to your watchlist` : `Removed ${sym} from your watchlist`,
      watchlist: updated,
    };
  },
};
