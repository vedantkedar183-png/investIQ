/**
 * @investiq/shared
 * Shared financial calculation helpers, constants, and utilities for Web, Mobile, and Backend.
 */

// Calculate 52-week price range percentage (where current price sits between low and high)
export function get52WeekRatio(currentPrice, low52Week, high52Week) {
  if (!low52Week || !high52Week || high52Week === low52Week) return 50;
  const ratio = ((currentPrice - low52Week) / (high52Week - low52Week)) * 100;
  return Math.min(Math.max(parseFloat(ratio.toFixed(2)), 0), 100);
}

// Calculate Compound Annual Growth Rate (CAGR)
export function calculateCAGR(beginningValue, endingValue, years) {
  if (beginningValue <= 0 || years <= 0) return 0;
  const cagr = (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
  return parseFloat(cagr.toFixed(2));
}

// Calculate SIP Maturity Value
export function calculateSIP(monthlyInvestment, annualRatePercent, tenureYears) {
  const i = (annualRatePercent / 100) / 12;
  const n = tenureYears * 12;
  const investedAmount = monthlyInvestment * n;
  
  if (i === 0) {
    return {
      investedAmount,
      estimatedReturns: 0,
      totalValue: investedAmount,
    };
  }

  const totalValue = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const estimatedReturns = totalValue - investedAmount;

  return {
    investedAmount: Math.round(investedAmount),
    estimatedReturns: Math.round(estimatedReturns),
    totalValue: Math.round(totalValue),
  };
}

// Calculate Lumpsum Investment Maturity Value
export function calculateLumpsum(totalInvestment, annualRatePercent, tenureYears) {
  const r = annualRatePercent / 100;
  const totalValue = totalInvestment * Math.pow(1 + r, tenureYears);
  const estimatedReturns = totalValue - totalInvestment;

  return {
    investedAmount: Math.round(totalInvestment),
    estimatedReturns: Math.round(estimatedReturns),
    totalValue: Math.round(totalValue),
  };
}

// Calculate Profit and Loss metrics
export function calculatePL(currentPrice, buyPrice, quantity) {
  const investedValue = buyPrice * quantity;
  const currentValue = currentPrice * quantity;
  const absolutePL = currentValue - investedValue;
  const percentPL = investedValue > 0 ? (absolutePL / investedValue) * 100 : 0;

  return {
    investedValue: parseFloat(investedValue.toFixed(2)),
    currentValue: parseFloat(currentValue.toFixed(2)),
    absolutePL: parseFloat(absolutePL.toFixed(2)),
    percentPL: parseFloat(percentPL.toFixed(2)),
    isProfit: absolutePL >= 0,
  };
}

// Currency Formatter helper
export function formatCurrency(amount, currency = 'INR', locale = 'en-IN') {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  if (currency === 'INR') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Constants
export const ASSET_TYPES = {
  STOCK: 'STOCK',
  MUTUAL_FUND: 'MUTUAL_FUND',
  FNO: 'FNO',
  FD: 'FD',
  BOND: 'BOND',
};

export const RISK_LEVELS = {
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
};
