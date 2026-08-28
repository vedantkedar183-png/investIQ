import { db } from '../data/db.js';

export const reportService = {
  // Get all transaction logs for a user
  async getTransactions(userId = 'demo-user-1', { type = '', symbol = '', limit = 50 } = {}) {
    let user = await db.findUserById(userId);
    if (!user) user = await db.findUserByEmail('demo@investiq.com');
    const uId = user ? user.id : userId;

    let txs = await db.getUserTransactions(uId);

    if (type && type !== 'ALL') {
      txs = txs.filter((t) => t.type.toUpperCase() === type.toUpperCase());
    }

    if (symbol) {
      txs = txs.filter((t) => t.assetSymbol.toUpperCase().includes(symbol.toUpperCase()));
    }

    return {
      totalCount: txs.length,
      transactions: txs.slice(0, parseInt(limit)),
    };
  },

  // Calculate SIP Projection
  calculateSIP({ monthlyInvestment = 5000, annualRate = 12, tenureYears = 10 }) {
    const P = parseFloat(monthlyInvestment);
    const r = parseFloat(annualRate) / 100 / 12;
    const n = parseFloat(tenureYears) * 12;

    const investedAmount = P * n;
    let totalValue = investedAmount;

    if (r > 0) {
      totalValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    }

    const estimatedReturns = totalValue - investedAmount;

    const yearlyBreakdown = [];
    for (let yr = 1; yr <= tenureYears; yr++) {
      const yrMonths = yr * 12;
      const yrInvested = P * yrMonths;
      const yrTotal = P * ((Math.pow(1 + r, yrMonths) - 1) / r) * (1 + r);
      yearlyBreakdown.push({
        year: `Yr ${yr}`,
        invested: Math.round(yrInvested),
        returns: Math.round(yrTotal - yrInvested),
        total: Math.round(yrTotal),
      });
    }

    return {
      monthlyInvestment: P,
      annualRatePercent: annualRate,
      tenureYears,
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue),
      yearlyBreakdown,
    };
  },

  // Calculate Lumpsum Investment
  calculateLumpsum({ investmentAmount = 100000, annualRate = 12, tenureYears = 5 }) {
    const P = parseFloat(investmentAmount);
    const r = parseFloat(annualRate) / 100;
    const t = parseFloat(tenureYears);

    const totalValue = P * Math.pow(1 + r, t);
    const estimatedReturns = totalValue - P;

    const yearlyBreakdown = [];
    for (let yr = 1; yr <= tenureYears; yr++) {
      const yrTotal = P * Math.pow(1 + r, yr);
      yearlyBreakdown.push({
        year: `Yr ${yr}`,
        invested: Math.round(P),
        returns: Math.round(yrTotal - P),
        total: Math.round(yrTotal),
      });
    }

    return {
      investmentAmount: P,
      annualRatePercent: annualRate,
      tenureYears,
      investedAmount: Math.round(P),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue),
      yearlyBreakdown,
    };
  },
};
