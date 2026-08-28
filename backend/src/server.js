import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

import { db } from './data/db.js';

// Middlewares
app.use(
  cors({
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(morgan('dev'));

function healthPayload() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'investIQ REST API',
    version: '1.0.0',
  };
}

app.get('/', (req, res) => res.json(healthPayload()));
app.get('/health', (req, res) => res.json(healthPayload()));
app.get('/api/health', (req, res) => res.json(healthPayload()));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/watchlist', watchlistRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/reports', reportRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[investIQ API Error]:', err.stack);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

async function startServer() {
  if (db.isPostgres) {
    await db.initPostgresTables();
  }

  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 investIQ Backend API running on http://localhost:${PORT}`);
    console.log(`📈 Market, Portfolio, AI, & Auth endpoints ready.`);
    console.log(`=========================================`);
  });
}

startServer();
