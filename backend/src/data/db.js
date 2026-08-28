import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, 'investiq.db.json');

// Default initial dataset
const DEFAULT_DATA = {
  users: [
    {
      id: 'demo-user-1',
      email: 'demo@investiq.com',
      name: 'Aditya Sharma',
      passwordHash: bcrypt.hashSync('password123', 10),
      cashBalance: 125000.0,
      riskProfile: 'MODERATE',
      currency: 'INR',
      createdAt: new Date().toISOString(),
    },
  ],
  indices: [
    { symbol: 'NIFTY 50', name: 'Nifty 50', ticker: '^NSEI', value: 24823.15, change: 142.60, changePercent: 0.58, isPositive: true },
    { symbol: 'SENSEX', name: 'BSE Sensex', ticker: '^BSESN', value: 81332.72, change: 480.25, changePercent: 0.59, isPositive: true },
    { symbol: 'BANK NIFTY', name: 'Bank Nifty', ticker: '^NSEBANK', value: 51240.80, change: -85.40, changePercent: -0.17, isPositive: false },
    { symbol: 'NIFTY IT', name: 'Nifty IT', ticker: '^CNXIT', value: 41850.60, change: 320.10, changePercent: 0.77, isPositive: true },
    { symbol: 'S&P 500', name: 'S&P 500', ticker: '^GSPC', value: 5634.20, change: 24.80, changePercent: 0.44, isPositive: true },
    { symbol: 'NASDAQ', name: 'Nasdaq 100', ticker: '^IXIC', value: 19780.40, change: 110.50, changePercent: 0.56, isPositive: true },
  ],
  assets: [
    {
      id: 'stock-reliance',
      symbol: 'RELIANCE',
      ticker: 'RELIANCE.NS',
      name: 'Reliance Industries Ltd.',
      type: 'STOCK',
      exchange: 'NSE',
      sector: 'Energy & Retail',
      currentPrice: 3012.40,
      previousClose: 2985.00,
      change: 27.40,
      changePercent: 0.92,
      high52Week: 3217.90,
      low52Week: 2220.30,
      peRatio: 28.4,
      pbRatio: 2.3,
      marketCap: '₹ 20.38 Lakh Cr',
      dividendYield: 0.33,
      roe: 9.8,
      volume: '8.4M',
      pattern: 'Bullish Flag Breakout',
      technicalSignal: 'STRONG_BUY',
      rsi: 62.4,
      description: 'Reliance Industries is India’s largest conglomerate spanning Oil-to-Chemicals, Telecom (Jio), Retail, and Green Energy.',
    },
    {
      id: 'stock-tcs',
      symbol: 'TCS',
      ticker: 'TCS.NS',
      name: 'Tata Consultancy Services Ltd.',
      type: 'STOCK',
      exchange: 'NSE',
      sector: 'Information Technology',
      currentPrice: 4280.15,
      previousClose: 4235.00,
      change: 45.15,
      changePercent: 1.07,
      high52Week: 4565.00,
      low52Week: 3313.00,
      peRatio: 31.8,
      pbRatio: 14.2,
      marketCap: '₹ 15.48 Lakh Cr',
      dividendYield: 1.25,
      roe: 48.2,
      volume: '3.1M',
      pattern: 'Ascending Triangle',
      technicalSignal: 'BUY',
      rsi: 58.1,
      description: 'Tata Consultancy Services is a global leader in IT services, consulting, and business solutions.',
    },
    {
      id: 'stock-infy',
      symbol: 'INFY',
      ticker: 'INFY.NS',
      name: 'Infosys Ltd.',
      type: 'STOCK',
      exchange: 'NSE',
      sector: 'Information Technology',
      currentPrice: 1845.50,
      previousClose: 1860.00,
      change: -14.50,
      changePercent: -0.78,
      high52Week: 1950.00,
      low52Week: 1355.00,
      peRatio: 27.6,
      pbRatio: 8.4,
      marketCap: '₹ 7.66 Lakh Cr',
      dividendYield: 2.1,
      roe: 31.5,
      volume: '6.2M',
      pattern: 'Consolidation at Support',
      technicalSignal: 'NEUTRAL',
      rsi: 48.9,
      description: 'Infosys provides next-generation digital services and consulting across more than 50 countries.',
    },
    {
      id: 'stock-hdfcbank',
      symbol: 'HDFCBANK',
      ticker: 'HDFCBANK.NS',
      name: 'HDFC Bank Ltd.',
      type: 'STOCK',
      exchange: 'NSE',
      sector: 'Banking & Finance',
      currentPrice: 1648.70,
      previousClose: 1632.00,
      change: 16.70,
      changePercent: 1.02,
      high52Week: 1794.00,
      low52Week: 1363.55,
      peRatio: 18.2,
      pbRatio: 2.8,
      marketCap: '₹ 12.54 Lakh Cr',
      dividendYield: 1.18,
      roe: 16.4,
      volume: '14.5M',
      pattern: 'Golden Cross (50/200 DMA)',
      technicalSignal: 'STRONG_BUY',
      rsi: 65.2,
      description: 'HDFC Bank is India’s largest private sector bank with extensive retail and wholesale banking networks.',
    },
    {
      id: 'stock-tatamotors',
      symbol: 'TATAMOTORS',
      ticker: 'TATAMOTORS.NS',
      name: 'Tata Motors Ltd.',
      type: 'STOCK',
      exchange: 'NSE',
      sector: 'Automobile',
      currentPrice: 1092.30,
      previousClose: 1068.00,
      change: 24.30,
      changePercent: 2.28,
      high52Week: 1179.05,
      low52Week: 593.50,
      peRatio: 12.1,
      pbRatio: 4.1,
      marketCap: '₹ 4.02 Lakh Cr',
      dividendYield: 0.55,
      roe: 34.0,
      volume: '9.8M',
      pattern: 'Cup and Handle',
      technicalSignal: 'STRONG_BUY',
      rsi: 71.0,
      description: 'Tata Motors is a multinational automotive manufacturing company and market leader in Indian electric vehicles and commercial vehicles.',
    },
    {
      id: 'stock-nvda',
      symbol: 'NVDA',
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      type: 'STOCK',
      exchange: 'NASDAQ',
      sector: 'Semiconductors & AI',
      currentPrice: 128.50,
      previousClose: 124.20,
      change: 4.30,
      changePercent: 3.46,
      high52Week: 140.76,
      low52Week: 39.23,
      peRatio: 64.2,
      pbRatio: 52.1,
      marketCap: '$ 3.16 Trillion',
      dividendYield: 0.03,
      roe: 115.0,
      volume: '45.2M',
      pattern: 'Bullish Pennant',
      technicalSignal: 'STRONG_BUY',
      rsi: 68.3,
      description: 'NVIDIA pioneered GPU-accelerated computing and is the dominant provider of AI hardware and chips globally.',
    },
    {
      id: 'stock-aapl',
      symbol: 'AAPL',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      type: 'STOCK',
      exchange: 'NASDAQ',
      sector: 'Consumer Electronics',
      currentPrice: 228.40,
      previousClose: 226.10,
      change: 2.30,
      changePercent: 1.02,
      high52Week: 237.23,
      low52Week: 164.08,
      peRatio: 34.1,
      pbRatio: 48.0,
      marketCap: '$ 3.48 Trillion',
      dividendYield: 0.44,
      roe: 147.0,
      volume: '38.6M',
      pattern: 'Ascending Channel',
      technicalSignal: 'BUY',
      rsi: 61.2,
      description: 'Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and services.',
    },
    {
      id: 'stock-mrf',
      symbol: 'MRF',
      ticker: 'MRF.NS',
      name: 'MRF Limited',
      type: 'STOCK',
      exchange: 'NSE',
      sector: 'Auto Tyres & Rubber',
      currentPrice: 135400.00,
      previousClose: 135000.00,
      change: 400.00,
      changePercent: 0.30,
      high52Week: 151283.40,
      low52Week: 99400.00,
      peRatio: 28.5,
      pbRatio: 3.5,
      marketCap: '₹ 57,400 Cr',
      dividendYield: 0.15,
      roe: 12.5,
      volume: '15.4K',
      pattern: 'High Beta Sideways',
      technicalSignal: 'HOLD',
      rsi: 50.2,
      description: 'Madras Rubber Factory (MRF) is India’s largest manufacturer of tyres and rubber products.',
    },
    {
      id: 'stock-ceat',
      symbol: 'CEAT',
      ticker: 'CEATLTD.NS',
      name: 'CEAT Limited',
      type: 'STOCK',
      exchange: 'NSE',
      sector: 'Auto Tyres & Rubber',
      currentPrice: 2840.50,
      previousClose: 2810.00,
      change: 30.50,
      changePercent: 1.08,
      high52Week: 2999.00,
      low52Week: 1980.00,
      peRatio: 18.2,
      pbRatio: 2.1,
      marketCap: '₹ 11,200 Cr',
      dividendYield: 1.05,
      roe: 14.1,
      volume: '450.2K',
      pattern: 'Bull Flag Breakout',
      technicalSignal: 'BUY',
      rsi: 61.4,
      description: 'CEAT Limited is a flagship company of RPG Enterprises and a leading tyre manufacturer in India.',
    },
    // Mutual Funds
    {
      id: 'mf-parag-parikh',
      symbol: 'PPFAS_FLEXI',
      name: 'Parag Parikh Flexi Cap Fund Direct-Growth',
      type: 'MUTUAL_FUND',
      category: 'Flexi Cap Fund',
      nav: 78.45,
      previousNav: 77.80,
      changePercent: 0.84,
      riskLevel: 'MODERATE',
      expectedReturns: '16.8% p.a.',
      returns1Y: 28.4,
      returns3Y: 21.2,
      returns5Y: 23.6,
      minSip: 1000,
      aum: '₹ 72,400 Cr',
      expenseRatio: '0.62%',
      fundManager: 'Rajeev Thakkar',
      investmentPeriod: '5+ Years',
      description: 'Invests across large, mid, and small-cap stocks, with an allocation to international equities like Alphabet and Meta.',
    },
    {
      id: 'mf-sbi-bluechip',
      symbol: 'SBI_BLUECHIP',
      name: 'SBI Bluechip Fund Direct-Growth',
      type: 'MUTUAL_FUND',
      category: 'Large Cap Fund',
      nav: 94.20,
      previousNav: 93.65,
      changePercent: 0.59,
      riskLevel: 'LOW',
      expectedReturns: '13.2% p.a.',
      returns1Y: 22.1,
      returns3Y: 16.5,
      returns5Y: 17.8,
      minSip: 500,
      aum: '₹ 46,120 Cr',
      expenseRatio: '0.85%',
      fundManager: 'Sohini Andani',
      investmentPeriod: '3-5 Years',
      description: 'A bluechip fund focusing on top 100 Indian companies with stable long-term compounding and low volatility.',
    },
    {
      id: 'mf-axis-smallcap',
      symbol: 'AXIS_SMALLCAP',
      name: 'Axis Small Cap Fund Direct-Growth',
      type: 'MUTUAL_FUND',
      category: 'Small Cap Fund',
      nav: 112.60,
      previousNav: 110.80,
      changePercent: 1.62,
      riskLevel: 'HIGH',
      expectedReturns: '22.5% p.a.',
      returns1Y: 38.6,
      returns3Y: 26.4,
      returns5Y: 28.1,
      minSip: 500,
      aum: '₹ 22,850 Cr',
      expenseRatio: '0.54%',
      fundManager: 'Anupam Tiwari',
      investmentPeriod: '5-7 Years',
      description: 'Focuses on high-growth emerging small-cap companies with strong competitive moats and balance sheets.',
    },
    // FDs & Bonds
    {
      id: 'fd-hdfc',
      symbol: 'HDFC_FD_3Y',
      name: 'HDFC Bank Fixed Deposit (3 Years)',
      type: 'FD',
      category: 'Bank Fixed Deposit',
      interestRate: '7.25% p.a.',
      payoutFrequency: 'Quarterly / Maturity',
      riskLevel: 'LOW',
      tenure: '3 Years (36 Months)',
      minInvestment: 5000,
      creditRating: 'AAA (Crisil / ICRA)',
      description: 'Guaranteed returns backed by India’s largest private bank with DICGC insurance protection.',
    },
    {
      id: 'bond-goi-2033',
      symbol: 'GOI_718_2033',
      name: '7.18% Government of India Sovereign Bond 2033',
      type: 'BOND',
      category: 'Government Sovereign Bond',
      yieldPercent: '7.18% p.a.',
      couponRate: '7.18%',
      riskLevel: 'LOW',
      maturityDate: '14 Aug 2033',
      minInvestment: 10000,
      creditRating: 'Sovereign (Risk-Free)',
      description: 'Direct sovereign debt security issued by RBI on behalf of the Government of India with semi-annual coupon payments.',
    },
    {
      id: 'fno-nifty-fut',
      symbol: 'NIFTY_FUT',
      name: 'Nifty 50 Index Futures',
      type: 'FNO',
      category: 'Index Futures',
      currentPrice: 24850.0,
      previousClose: 24720.0,
      change: 130.0,
      changePercent: 0.53,
      riskLevel: 'HIGH',
      lotSize: 75,
      expiry: 'Near Month',
      description: 'NSE Nifty 50 near-month index futures for directional and hedging strategies.',
    },
    {
      id: 'fno-banknifty-opt',
      symbol: 'BANKNIFTY_OPT',
      name: 'Bank Nifty Weekly Options',
      type: 'FNO',
      category: 'Index Options',
      currentPrice: 185.4,
      previousClose: 172.0,
      change: 13.4,
      changePercent: 7.79,
      riskLevel: 'HIGH',
      lotSize: 30,
      expiry: 'Weekly',
      description: 'Bank Nifty weekly options for high-beta directional trades. Paper-trading only.',
    },
  ],
  holdings: [
    {
      id: 'holding-1',
      userId: 'demo-user-1',
      assetSymbol: 'RELIANCE',
      assetType: 'STOCK',
      assetName: 'Reliance Industries Ltd.',
      quantity: 15,
      averageBuyPrice: 2840.00,
      currentPrice: 3012.40,
    },
    {
      id: 'holding-2',
      userId: 'demo-user-1',
      assetSymbol: 'HDFCBANK',
      assetType: 'STOCK',
      assetName: 'HDFC Bank Ltd.',
      quantity: 30,
      averageBuyPrice: 1510.50,
      currentPrice: 1648.70,
    },
    {
      id: 'holding-3',
      userId: 'demo-user-1',
      assetSymbol: 'PPFAS_FLEXI',
      assetType: 'MUTUAL_FUND',
      assetName: 'Parag Parikh Flexi Cap Fund Direct-Growth',
      quantity: 450,
      averageBuyPrice: 65.20,
      currentPrice: 78.45,
    },
  ],
  transactions: [
    {
      id: 'tx-101',
      userId: 'demo-user-1',
      assetSymbol: 'RELIANCE',
      assetName: 'Reliance Industries Ltd.',
      type: 'BUY',
      quantity: 15,
      price: 2840.00,
      totalAmount: 42600.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    },
    {
      id: 'tx-102',
      userId: 'demo-user-1',
      assetSymbol: 'HDFCBANK',
      assetName: 'HDFC Bank Ltd.',
      type: 'BUY',
      quantity: 30,
      price: 1510.50,
      totalAmount: 45315.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
  ],
  watchlists: [
    {
      id: 'wl-default',
      userId: 'demo-user-1',
      name: 'Primary Watchlist',
      symbols: ['RELIANCE', 'TCS', 'TATAMOTORS', 'PPFAS_FLEXI', 'NVDA', 'AAPL'],
    },
  ],
};

class UnifiedDatabase {
  constructor() {
    this.isPostgres = !!process.env.DATABASE_URL;
    this.pool = null;
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));

    if (this.isPostgres) {
      console.log('📡 [Database] Connecting to hosted cloud PostgreSQL database...');
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      });
      // Initialization moved to async setup function
    } else {
      console.log(`📁 [Database] Running with local persistent file store: ${DB_FILE}`);
      this.loadLocal();
    }
  }

  // Initialize PostgreSQL Schema
  async initPostgresTables() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          cash_balance NUMERIC(15,2) DEFAULT 100000.00,
          risk_profile VARCHAR(32) DEFAULT 'MODERATE',
          currency VARCHAR(16) DEFAULT 'INR',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS holdings (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          asset_symbol VARCHAR(64) NOT NULL,
          asset_type VARCHAR(32) NOT NULL,
          asset_name VARCHAR(255) NOT NULL,
          quantity NUMERIC(15,4) NOT NULL,
          average_buy_price NUMERIC(15,2) NOT NULL,
          current_price NUMERIC(15,2) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          asset_symbol VARCHAR(64) NOT NULL,
          asset_name VARCHAR(255) NOT NULL,
          type VARCHAR(16) NOT NULL,
          quantity NUMERIC(15,4) NOT NULL,
          price NUMERIC(15,2) NOT NULL,
          total_amount NUMERIC(15,2) NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS watchlists (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) DEFAULT 'My Watchlist',
          symbols TEXT[] DEFAULT ARRAY['RELIANCE', 'TCS', 'TATAMOTORS', 'PPFAS_FLEXI', 'NVDA']
        );
      `);

      // Ensure demo user exists in Postgres
      const demoRes = await this.pool.query(`SELECT * FROM users WHERE email = 'demo@investiq.com'`);
      if (demoRes.rows.length === 0) {
        const demoUser = DEFAULT_DATA.users[0];
        await this.pool.query(
          `INSERT INTO users (id, email, name, password_hash, cash_balance, risk_profile, currency) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [demoUser.id, demoUser.email, demoUser.name, demoUser.passwordHash, demoUser.cashBalance, demoUser.riskProfile, demoUser.currency]
        );

        for (const h of DEFAULT_DATA.holdings) {
          await this.pool.query(
            `INSERT INTO holdings (id, user_id, asset_symbol, asset_type, asset_name, quantity, average_buy_price, current_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [h.id, h.userId, h.assetSymbol, h.assetType, h.assetName, h.quantity, h.averageBuyPrice, h.currentPrice]
          );
        }

        for (const tx of DEFAULT_DATA.transactions) {
          await this.pool.query(
            `INSERT INTO transactions (id, user_id, asset_symbol, asset_name, type, quantity, price, total_amount, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [tx.id, tx.userId, tx.assetSymbol, tx.assetName, tx.type, tx.quantity, tx.price, tx.totalAmount, tx.timestamp]
          );
        }

        const wl = DEFAULT_DATA.watchlists[0];
        await this.pool.query(
          `INSERT INTO watchlists (id, user_id, name, symbols) VALUES ($1, $2, $3, $4)`,
          [wl.id, wl.userId, wl.name, wl.symbols]
        );
      }
      console.log('✅ [Database] Hosted Cloud PostgreSQL schema initialized & ready!');
    } catch (err) {
      console.error('❌ [Database] PostgreSQL initialization error:', err.message);
    }
  }

  // Local file operations
  loadLocal() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      }
    } catch (err) {
      console.warn(`[Database] Initializing fresh file ${DB_FILE}`);
    }
    this.saveLocal(DEFAULT_DATA);
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  saveLocal(dataToSave = this.data) {
    if (this.isPostgres) return;
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to write file:', err);
    }
  }

  // --- User Operations ---
  async findUserByEmail(email) {
    if (!email) return null;
    if (this.isPostgres) {
      const res = await this.pool.query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [email.trim()]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        passwordHash: row.password_hash,
        cashBalance: parseFloat(row.cash_balance),
        riskProfile: row.risk_profile,
        currency: row.currency,
        createdAt: row.created_at,
      };
    }
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    if (!id) return null;
    if (this.isPostgres) {
      const res = await this.pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        passwordHash: row.password_hash,
        cashBalance: parseFloat(row.cash_balance),
        riskProfile: row.risk_profile,
        currency: row.currency,
        createdAt: row.created_at,
      };
    }
    return this.data.users.find((u) => u.id === id) || null;
  }

  async createUser(userData) {
    const newUser = {
      id: `user-${uuidv4().substring(0, 8)}`,
      email: userData.email.toLowerCase(),
      name: userData.name,
      passwordHash: userData.passwordHash,
      cashBalance: userData.cashBalance || 100000.0,
      riskProfile: userData.riskProfile || 'MODERATE',
      currency: userData.currency || 'INR',
      createdAt: new Date().toISOString(),
    };

    if (this.isPostgres) {
      await this.pool.query(
        `INSERT INTO users (id, email, name, password_hash, cash_balance, risk_profile, currency) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [newUser.id, newUser.email, newUser.name, newUser.passwordHash, newUser.cashBalance, newUser.riskProfile, newUser.currency]
      );
      // Create initial empty watchlist
      await this.pool.query(
        `INSERT INTO watchlists (id, user_id, name, symbols) VALUES ($1, $2, $3, $4)`,
        [`wl-${uuidv4().substring(0, 8)}`, newUser.id, 'My Watchlist', ['RELIANCE', 'TCS', 'NVDA']]
      );
      return newUser;
    }

    this.data.users.push(newUser);
    this.saveLocal();
    return newUser;
  }

  async updateUser(id, updates) {
    if (this.isPostgres) {
      if (updates.cashBalance !== undefined) {
        await this.pool.query(`UPDATE users SET cash_balance = $1 WHERE id = $2`, [updates.cashBalance, id]);
      }
      if (updates.riskProfile !== undefined) {
        await this.pool.query(`UPDATE users SET risk_profile = $1 WHERE id = $2`, [updates.riskProfile, id]);
      }
      return this.findUserById(id);
    }

    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates);
    this.saveLocal();
    return user;
  }

  // --- Holdings Operations ---
  async getUserHoldings(userId) {
    if (this.isPostgres) {
      const res = await this.pool.query(`SELECT * FROM holdings WHERE user_id = $1`, [userId]);
      return res.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        assetSymbol: row.asset_symbol,
        assetType: row.asset_type,
        assetName: row.asset_name,
        quantity: parseFloat(row.quantity),
        averageBuyPrice: parseFloat(row.average_buy_price),
        currentPrice: parseFloat(row.current_price),
      }));
    }
    return this.data.holdings.filter((h) => h.userId === userId);
  }

  async saveHolding(holding) {
    if (this.isPostgres) {
      const res = await this.pool.query(`SELECT id FROM holdings WHERE id = $1`, [holding.id]);
      if (res.rows.length > 0) {
        await this.pool.query(
          `UPDATE holdings SET quantity = $1, average_buy_price = $2, current_price = $3 WHERE id = $4`,
          [holding.quantity, holding.averageBuyPrice, holding.currentPrice, holding.id]
        );
      } else {
        await this.pool.query(
          `INSERT INTO holdings (id, user_id, asset_symbol, asset_type, asset_name, quantity, average_buy_price, current_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [holding.id, holding.userId, holding.assetSymbol, holding.assetType, holding.assetName, holding.quantity, holding.averageBuyPrice, holding.currentPrice]
        );
      }
      return;
    }

    const index = this.data.holdings.findIndex((h) => h.id === holding.id);
    if (index > -1) {
      this.data.holdings[index] = holding;
    } else {
      this.data.holdings.push(holding);
    }
    this.saveLocal();
  }

  async deleteHolding(holdingId) {
    if (this.isPostgres) {
      await this.pool.query(`DELETE FROM holdings WHERE id = $1`, [holdingId]);
      return;
    }
    this.data.holdings = this.data.holdings.filter((h) => h.id !== holdingId);
    this.saveLocal();
  }

  // --- Transactions Operations ---
  async addTransaction(tx) {
    if (this.isPostgres) {
      await this.pool.query(
        `INSERT INTO transactions (id, user_id, asset_symbol, asset_name, type, quantity, price, total_amount, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [tx.id, tx.userId, tx.assetSymbol, tx.assetName, tx.type, tx.quantity, tx.price, tx.totalAmount, tx.timestamp]
      );
      return tx;
    }

    this.data.transactions.unshift(tx);
    this.saveLocal();
    return tx;
  }

  async getUserTransactions(userId) {
    if (this.isPostgres) {
      const res = await this.pool.query(`SELECT * FROM transactions WHERE user_id = $1 ORDER BY timestamp DESC`, [userId]);
      return res.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        assetSymbol: r.asset_symbol,
        assetName: r.asset_name,
        type: r.type,
        quantity: parseFloat(r.quantity),
        price: parseFloat(r.price),
        totalAmount: parseFloat(r.total_amount),
        timestamp: r.timestamp,
      }));
    }
    return this.data.transactions.filter((t) => t.userId === userId);
  }

  // --- Watchlist Operations ---
  async getUserWatchlist(userId) {
    if (this.isPostgres) {
      const res = await this.pool.query(`SELECT * FROM watchlists WHERE user_id = $1 LIMIT 1`, [userId]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return { id: row.id, userId: row.user_id, name: row.name, symbols: row.symbols || [] };
      }
      const newWl = {
        id: `wl-${uuidv4().substring(0, 8)}`,
        userId,
        name: 'My Watchlist',
        symbols: ['RELIANCE', 'TCS', 'TATAMOTORS', 'PPFAS_FLEXI', 'NVDA'],
      };
      await this.pool.query(`INSERT INTO watchlists (id, user_id, name, symbols) VALUES ($1, $2, $3, $4)`, [
        newWl.id,
        newWl.userId,
        newWl.name,
        newWl.symbols,
      ]);
      return newWl;
    }

    let wl = this.data.watchlists.find((w) => w.userId === userId);
    if (!wl) {
      wl = {
        id: `wl-${uuidv4().substring(0, 8)}`,
        userId,
        name: 'My Watchlist',
        symbols: ['RELIANCE', 'TCS', 'TATAMOTORS', 'PPFAS_FLEXI', 'NVDA'],
      };
      this.data.watchlists.push(wl);
      this.saveLocal();
    }
    return wl;
  }

  async saveWatchlist(wl) {
    if (this.isPostgres) {
      await this.pool.query(`UPDATE watchlists SET symbols = $1, name = $2 WHERE id = $3`, [wl.symbols, wl.name, wl.id]);
      return;
    }

    const index = this.data.watchlists.findIndex((w) => w.id === wl.id);
    if (index > -1) {
      this.data.watchlists[index] = wl;
    } else {
      this.data.watchlists.push(wl);
    }
    this.saveLocal();
  }
}

export const db = new UnifiedDatabase();
