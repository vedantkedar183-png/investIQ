# 🚀 investIQ - Production-Ready Multi-Asset Investment & Trading OS

**investIQ** is a full-featured, cross-platform financial platform supporting **Live Stock & Asset Tracking**, **Simulated Paper Trading**, **52-Week High/Low Meters**, **Interactive Charts**, **Mutual Funds SIP Planner**, and **Google Gemini AI News Sentiment Intelligence**.

---

## 🏛️ Architecture Stack

- **Web Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), SVG financial charting
- **Backend API**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [Yahoo Finance API](https://github.com/gadicc/node-yahoo-finance2), [Google Gemini AI SDK](https://ai.google.dev/), [Bcrypt](https://www.npmjs.com/package/bcryptjs), [JWT](https://jwt.io/)
- **Database**: Persistent Disk-Backed JSON/SQLite Repository (`backend/src/data/investiq.db.json`)
- **Mobile App**: [React Native](https://reactnative.dev/) with [Expo SDK 51](https://expo.dev/) & React Navigation
- **Monorepo**: Shared financial calculation formulas (`@investiq/shared`)

---

## 🔑 API Keys Setup (Step-by-Step)

All API integrations are ready out-of-the-box with free provider fallbacks, and you can plug in your production API keys by editing `backend/.env`:

| Key | Provider | Where to get it (Free) | Purpose |
| :--- | :--- | :--- | :--- |
| **`GEMINI_API_KEY`** | Google AI Studio | [Google AI Studio](https://aistudio.google.com/app/apikey) | Powers deep AI news sentiment analysis, catalysts, and stock recommendations |
| **`NEWS_API_KEY`** | NewsAPI.org / Finnhub | [NewsAPI.org](https://newsapi.org) | Fetches global financial news headlines *(Fallback: Built-in RSS)* |
| **`STOCKS_API_KEY`** | Finnhub / Yahoo Finance | [Finnhub.io](https://finnhub.io) | Real-time live stock quotes *(Fallback: Free built-in Yahoo Finance)* |

### Configure Environment:
In `backend/.env`:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_2026

# Paste your keys here:
GEMINI_API_KEY=AIzaSy...
NEWS_API_KEY=
FINNHUB_API_KEY=
```

In `web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 💻 Local Development

### 1. Install all dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
npm run dev:backend
# Backend starts on http://localhost:5000
```

### 3. Start Next.js Web App
```bash
npm run dev:web
# Web application starts on http://localhost:3000
```

### 4. Start React Native Mobile App
```bash
npm start --workspace=mobile
# Run in Expo Go on iOS / Android
```

---

## 🚢 Production Deployment

### Option A: 1-Click Docker Deployment
```bash
docker compose up -d --build
```
- Backend accessible on port `5000`
- Web Frontend accessible on port `3000`

### Option B: Cloud Hosting (Vercel + Render / Railway)
1. **Backend** (Deploy to [Render](https://render.com) or [Railway](https://railway.app)):
   - Root directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Set environment variables (`GEMINI_API_KEY`, `JWT_SECRET`, etc.)
2. **Frontend** (Deploy to [Vercel](https://vercel.com)):
   - Root directory: `web`
   - Framework preset: **Next.js**
   - Set Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api/v1`

---

## 🔐 Default Demo Credentials
- **Email**: `demo@investiq.com`
- **Password**: `password123`
- *Or use the **"1-Click Demo Investor Login"** button on the sign-in modal/page!*
