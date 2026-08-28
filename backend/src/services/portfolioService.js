import { db } from '../data/db.js';
import { marketService } from './marketService.js';
import { v4 as uuidv4 } from 'uuid';

export const portfolioService = {
  // Get portfolio overview for a user
  async getPortfolioSummary(userId = 'demo-user-1') {
    let user = await db.findUserById(userId);
    if (!user) user = await db.findUserByEmail('demo@investiq.com');
    if (!user) user = db.data.users[0];

    const userHoldings = await db.getUserHoldings(user.id);

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let todayPL = 0;

    const enrichedHoldings = await Promise.all(
      userHoldings.map(async (holding) => {
        const live = await marketService.getAssetBySymbol(holding.assetSymbol);
        const currentPrice = live ? live.currentPrice : holding.currentPrice;
        const previousClose = live ? live.previousClose : currentPrice;

        const invested = holding.quantity * holding.averageBuyPrice;
        const currentValue = holding.quantity * currentPrice;
        const pl = currentValue - invested;
        const plPercent = invested > 0 ? (pl / invested) * 100 : 0;
        const dayChange = (currentPrice - previousClose) * holding.quantity;

        totalInvested += invested;
        totalCurrentValue += currentValue;
        todayPL += dayChange;

        return {
          ...holding,
          currentPrice,
          previousClose,
          invested: parseFloat(invested.toFixed(2)),
          currentValue: parseFloat(currentValue.toFixed(2)),
          totalPL: parseFloat(pl.toFixed(2)),
          totalPLPercent: parseFloat(plPercent.toFixed(2)),
          todayChange: parseFloat(dayChange.toFixed(2)),
        };
      })
    );

    const netWorth = totalCurrentValue + (user.cashBalance || 0);
    const totalPL = totalCurrentValue - totalInvested;
    const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;
    const todayPLPercent = totalCurrentValue > 0 ? (todayPL / totalCurrentValue) * 100 : 0;

    let stocksValue = 0;
    let mutualFundsValue = 0;
    let fixedIncomeValue = 0;

    enrichedHoldings.forEach((h) => {
      if (h.assetType === 'STOCK') stocksValue += h.currentValue;
      else if (h.assetType === 'MUTUAL_FUND') mutualFundsValue += h.currentValue;
      else fixedIncomeValue += h.currentValue;
    });

    const assetAllocation = [
      {
        name: 'Equities / Stocks',
        value: parseFloat(stocksValue.toFixed(2)),
        percentage: netWorth > 0 ? parseFloat(((stocksValue / netWorth) * 100).toFixed(1)) : 0,
        color: '#10B981',
      },
      {
        name: 'Mutual Funds',
        value: parseFloat(mutualFundsValue.toFixed(2)),
        percentage: netWorth > 0 ? parseFloat(((mutualFundsValue / netWorth) * 100).toFixed(1)) : 0,
        color: '#3B82F6',
      },
      {
        name: 'Cash Balance',
        value: parseFloat((user.cashBalance || 0).toFixed(2)),
        percentage: netWorth > 0 ? parseFloat((((user.cashBalance || 0) / netWorth) * 100).toFixed(1)) : 0,
        color: '#F59E0B',
      },
      {
        name: 'Fixed Income / Bonds',
        value: parseFloat(fixedIncomeValue.toFixed(2)),
        percentage: netWorth > 0 ? parseFloat(((fixedIncomeValue / netWorth) * 100).toFixed(1)) : 0,
        color: '#8B5CF6',
      },
    ];

    return {
      userId: user.id,
      userName: user.name,
      cashBalance: parseFloat((user.cashBalance || 0).toFixed(2)),
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
      netWorth: parseFloat(netWorth.toFixed(2)),
      totalPL: parseFloat(totalPL.toFixed(2)),
      totalPLPercent: parseFloat(totalPLPercent.toFixed(2)),
      todayPL: parseFloat(todayPL.toFixed(2)),
      todayPLPercent: parseFloat(todayPLPercent.toFixed(2)),
      holdingsCount: enrichedHoldings.length,
      holdings: enrichedHoldings,
      assetAllocation,
    };
  },

  // Execute a simulated Buy or Sell order with database persistence
  async executeTrade({ userId = 'demo-user-1', symbol, type, quantity, orderType = 'MARKET', limitPrice = null }) {
    let user = await db.findUserById(userId);
    if (!user) user = await db.findUserByEmail('demo@investiq.com');
    if (!user) user = db.data.users[0];

    const asset = await marketService.getAssetBySymbol(symbol);
    if (!asset) {
      throw new Error(`Asset ${symbol} not found in market registry.`);
    }

    const tradeQuantity = parseFloat(quantity);
    if (!tradeQuantity || tradeQuantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const executionPrice = limitPrice ? parseFloat(limitPrice) : (asset.currentPrice || asset.nav || 100);
    const totalAmount = parseFloat((tradeQuantity * executionPrice).toFixed(2));
    const normalizedType = type.toUpperCase();

    const userHoldings = await db.getUserHoldings(user.id);
    let existingHolding = userHoldings.find((h) => h.assetSymbol === asset.symbol);

    if (normalizedType === 'BUY') {
      if (user.cashBalance < totalAmount) {
        throw new Error(
          `Insufficient cash balance. Required: ₹${totalAmount.toLocaleString('en-IN')}, Available: ₹${user.cashBalance.toLocaleString('en-IN')}`
        );
      }

      // Deduct cash
      user.cashBalance -= totalAmount;
      await db.updateUser(user.id, { cashBalance: user.cashBalance });

      if (existingHolding) {
        const totalPreviousCost = existingHolding.quantity * existingHolding.averageBuyPrice;
        const newTotalQuantity = existingHolding.quantity + tradeQuantity;
        const newAveragePrice = (totalPreviousCost + totalAmount) / newTotalQuantity;

        existingHolding.quantity = newTotalQuantity;
        existingHolding.averageBuyPrice = parseFloat(newAveragePrice.toFixed(2));
        await db.saveHolding(existingHolding);
      } else {
        const newHolding = {
          id: `holding-${uuidv4().substring(0, 8)}`,
          userId: user.id,
          assetSymbol: asset.symbol,
          assetType: asset.type,
          assetName: asset.name,
          quantity: tradeQuantity,
          averageBuyPrice: executionPrice,
          currentPrice: executionPrice,
        };
        await db.saveHolding(newHolding);
      }
    } else if (normalizedType === 'SELL') {
      if (!existingHolding || existingHolding.quantity < tradeQuantity) {
        const availableQty = existingHolding ? existingHolding.quantity : 0;
        throw new Error(`Cannot sell ${tradeQuantity} shares. Available in portfolio: ${availableQty}`);
      }

      user.cashBalance += totalAmount;
      await db.updateUser(user.id, { cashBalance: user.cashBalance });

      if (Math.abs(existingHolding.quantity - tradeQuantity) < 0.0001) {
        await db.deleteHolding(existingHolding.id);
      } else {
        existingHolding.quantity -= tradeQuantity;
        await db.saveHolding(existingHolding);
      }
    } else {
      throw new Error(`Invalid trade type: ${type}`);
    }

    // Record Transaction
    const transaction = {
      id: `tx-${uuidv4().substring(0, 8)}`,
      userId: user.id,
      assetSymbol: asset.symbol,
      assetName: asset.name,
      type: normalizedType,
      quantity: tradeQuantity,
      price: executionPrice,
      totalAmount,
      timestamp: new Date().toISOString(),
    };

    await db.addTransaction(transaction);

    const updatedPortfolio = await this.getPortfolioSummary(user.id);

    return {
      success: true,
      message: `Executed ${normalizedType} order for ${tradeQuantity} ${asset.symbol} @ ₹${executionPrice.toLocaleString('en-IN')}`,
      transaction,
      updatedPortfolio,
    };
  },

  // Deposit cash topup
  async depositCash(userId = 'demo-user-1', amount = 50000) {
    let user = await db.findUserById(userId);
    if (!user) user = await db.findUserByEmail('demo@investiq.com');
    if (!user) user = db.data.users[0];

    const topup = Math.max(parseFloat(amount) || 0, 0);
    user.cashBalance = (user.cashBalance || 0) + topup;
    await db.updateUser(user.id, { cashBalance: user.cashBalance });

    return {
      success: true,
      message: `Added ₹${topup.toLocaleString('en-IN')} to virtual trading account.`,
      cashBalance: user.cashBalance,
    };
  },
};
