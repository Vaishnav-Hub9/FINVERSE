# FINVERSE 💎
### Behavior-Driven Financial Intelligence Platform

> *"It's not about how much you earn. It's about what you do with what you almost threw away."*

![FINVERSE Banner](https://img.shields.io/badge/FINVERSE-Behavior--Driven%20Finance-38bdf8?style=for-the-badge&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=flat-square&logo=bootstrap)

---

## 🧠 What Is FINVERSE?

Most financial apps tell you **where your money went**.  
FINVERSE tells you **what your money could have become**.

FINVERSE is a full-stack behavioral finance platform that tracks not just your spending — but the *psychology* behind it. Every time you mark a purchase as an impulse buy, the system calculates the compounding opportunity cost of that decision and reflects it back to you in real time.

FINVERSE makes the invisible damage visible.

---

## 🎯 Problem Statement

Despite earning stable incomes, a large percentage of young professionals in India consistently fail to build savings or investments. The reason is rarely insufficient income — it is **untracked behavioral spending patterns**: late-night purchases, BNPL traps, subscription creep, and weekend splurges that feel small individually but compound into significant financial damage over time.

Existing tools like spreadsheets track expenses but offer no **behavioral analysis**, no **impulse detection**, and no **opportunity cost engine**. They show you the past without helping you understand it.

**FINVERSE solves this** by combining a YNAB-style budget tracker with a behavioral analysis engine and an opportunity cost calculator — all connected to a single live data pipeline.

---

## ✨ Key Features

### 🔐 Authentication System
- Secure JWT-based login and signup
- Live password strength meter with 5-factor scoring
- bcrypt password hashing (12 salt rounds)
- Auto-login on page refresh via JWT expiry check
- 7-day token validity

### 🧭 Behavioral Onboarding Wizard
- 7-step personalized financial profiling
- Questions cover: primary goal, household size, debt profile, subscriptions, financial goals, guilt-free spending
- Dynamic insight HUD that updates with every click — not generic quotes, actual system responses
- Answers stored in MongoDB and used throughout the app to personalize suggestions
- Auto-seeds default budget categories based on user profile

### 📊 Plan — Budget Dashboard
- YNAB-style budget table grouped by Bills, Needs, Wants
- Live Assigned / Activity / Available columns — all calculated from transactions state
- Inline editable assigned amounts — click to edit, saves to backend instantly
- Active Underfunded / Overfunded filters with live category counts
- Add Category modal — fully working, saves to MongoDB
- Safe to Spend buffer — green when positive, red when negative
- Add Transaction modal with clean Income/Expense toggle

### 🧠 Behavioral Regrets Panel
- Dedicated right panel showing only impulse-flagged transactions
- Zero static strings — every number calculated live:
  - Total impulse spend
  - Regret ratio as % of total spending
  - Potential monthly recovery (15% of regret total — industry benchmark)
  - Late night detection: flags transactions after 10 PM with separate total
- Dynamic recommendation changes based on regret ratio thresholds:
  - Above 30%: 24-hour rule suggestion
  - 10–30%: category limit suggestion
  - Below 10%: positive reinforcement

### 📅 Bill Reminders System
- Manual reminder creation with due date, amount, recurring interval
- Auto-detection from transaction history — recognizes keywords like Netflix, Airtel, Jio, insurance
- Days-until-due badge: red (≤3 days), orange (≤7 days), green (upcoming)
- Mark as Paid with automatic next-occurrence generation for recurring bills
- Live summary: total upcoming bill amount + overdue count

### 📈 Reflect — Analytics Dashboard
- Discipline Score: `(1 - regretRatio) * 100` — mathematically honest, not arbitrary
- Recharts PieChart: spending by category from live transactions
- Recharts BarChart: intentional vs regret spending per category
- 6-Month Trend LineChart: dynamically calculated from transaction dates
- Savings Velocity: live savings rate vs 20% target benchmark
- Fast Facts: avg daily spend, most frequent category, largest outflow
- Behavioral Patterns: late-night count + amount, weekend spending, most expensive day
- Onboarding Insights: personalized warnings based on user's debt profile and goals

### 🏦 All Accounts
- PIN-locked for security
- Live balance calculations from transaction state:
  - Cleared Balance + Uncleared Balance = Working Balance
- Full transaction ledger with search, sorted by date
- Add Account modal — registers opening balance as income transaction
- Supports HDFC, SBI, ICICI, Axis, Kotak, PNB, BOB, Canara

### 📉 Trading Engine
- PIN-locked for security
- Add stocks by NSE/BSE symbol — price auto-fetches from Alpha Vantage API on symbol blur
- Live LIVE/MOCK badge per stock based on API response
- P&L and P&L% calculated live per stock
- Per-stock behavioral suggestion based on performance:
  - Up >15%: partial profit suggestion
  - Down <-10%: averaging down warning
  - 0–15%: holding zone
- Refresh prices manually — respects Alpha Vantage 5 calls/min free tier
- Fetches only when tab is opened — no unnecessary API drain

### 💡 Opportunity Cost Visualizer
The crown feature of FINVERSE.

**Formula:**
```
futureValue = totalRegret × (1 + 0.08)^5
moneyLost = futureValue - totalRegret
```

- Uses standard compound interest (Time Value of Money)
- Shows growth at 1, 3, 5, and 10 year intervals
- Recharts LineChart showing full 10-year growth curve
- Individual regret breakdown: each impulse purchase shown with its 5-year future value
- **Updates in real time** — add a regret transaction and every number recalculates instantly

### ⚙️ Settings Page
- PIN management for Trading and Accounts sections
- Set, change, or remove PINs with confirmation
- Password verification required before removing a PIN
- Financial profile summary from onboarding answers
- Sections auto-lock when navigating away

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 (Vite) |
| UI Library | Bootstrap 5 (CDN) |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Custom CSS Glassmorphism |
| Backend | Node.js + Express |
| Database | MongoDB (Atlas / Local) |
| ODM | Mongoose |
| Authentication | JWT + bcryptjs |
| Stock Prices | Alpha Vantage API |
| Environment | dotenv |

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────┐
│                  REACT FRONTEND                  │
│  ┌──────────┐ ┌─────────┐ ┌──────────────────┐  │
│  │  Auth    │ │Dashboard│ │   api.js wrapper  │  │
│  │ Login /  │ │ Plan    │ │  fetch() + JWT    │  │
│  │ Signup   │ │ Reflect │ │  header injection │  │
│  │Onboarding│ │Accounts │ │                  │  │
│  └──────────┘ │ Trading │ └──────────────────┘  │
│               │Settings │                        │
│               └─────────┘                        │
└────────────────────┬────────────────────────────┘
                     │ HTTP + JWT
                     ▼
┌─────────────────────────────────────────────────┐
│              EXPRESS REST API                    │
│  /api/auth        /api/transactions              │
│  /api/budget      /api/stocks                   │
│  /api/reminders                                 │
│                                                 │
│  middleware/auth.js — JWT verification          │
└────────────────────┬────────────────────────────┘
                     │ Mongoose ODM
                     ▼
┌─────────────────────────────────────────────────┐
│              MONGODB DATABASE                    │
│  users  transactions  budgetcategories          │
│  stocks  reminders                              │
└─────────────────────────────────────────────────┘
```

---

## 🧮 Core Calculations

All calculations are performed server-side in `/api/transactions/analytics` and live client-side from the `transactions` state array.

### Discipline Score
```js
regretRatio = totalRegret / totalSpent
disciplineScore = Math.round((1 - regretRatio) * 100)
// Clamped between 0 and 100
```

### Opportunity Cost (Compound Interest)
```js
// Standard Time Value of Money formula
futureValue = Math.round(totalRegret * Math.pow(1 + 0.08, 5))
moneyLost = futureValue - totalRegret
```
**Why 8%?** Average long-term S&P 500 / Nifty 50 index fund return.  
**Why 5 years?** Standard medium-term financial planning horizon.

### Potential Monthly Recovery
```js
potentialSavings = Math.round(totalRegret * 0.15)
```
**Why 15%?** Conservative industry benchmark for habit change impact.

### Budget Available
```js
activity = transactions
  .filter(t => t.category === categoryName && t.outflow > 0)
  .reduce((sum, t) => sum + t.outflow, 0)
available = assigned - activity
```

### Savings Velocity
```js
savingsRate = ((totalIncome - totalSpent) / totalIncome) * 100
// Target: 20% — standard personal finance benchmark
```

### Stock P&L
```js
pl = (currentPrice - buyPrice) * quantity
plPercent = ((currentPrice - buyPrice) / buyPrice) * 100
```

---

## 📁 Project Structure

```
FINVERSE/
├── client/                      # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── App.jsx              # Main app — all components
│   │   ├── api.js               # All fetch calls + JWT headers
│   │   ├── index.css            # Glassmorphism design system
│   │   └── main.jsx             # React entry point
│   └── index.html               # Bootstrap 5 CDN
│
└── server/                      # Node.js + Express Backend
    ├── index.js                 # Server entry point
    ├── .env                     # Environment variables (not committed)
    ├── .env.example             # Template for setup
    ├── middleware/
    │   └── auth.js              # JWT verification middleware
    ├── models/
    │   ├── User.js              # User schema + onboarding answers
    │   ├── Transaction.js       # Transaction schema
    │   ├── BudgetCategory.js    # Budget category schema
    │   ├── Stock.js             # Stock portfolio schema
    │   └── Reminder.js          # Bill reminder schema
    └── routes/
        ├── auth.js              # POST /signup, POST /login
        ├── transactions.js      # CRUD + /analytics endpoint
        ├── budget.js            # Budget category CRUD
        ├── stocks.js            # Stock portfolio CRUD + P&L
        └── reminders.js        # Reminder CRUD + auto-recurrence
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Alpha Vantage API key (free at alphavantage.co)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/finverse.git
cd finverse
```

### 2. Setup the backend
```bash
cd server
npm install
```

Create your `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/finverse
JWT_SECRET=your_secret_key_here
PORT=5000
```

Start the server:
```bash
node index.js
```

You should see:
```
MongoDB connected
Server running on port 5000
```

### 3. Setup the frontend
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Add your Alpha Vantage key
In `client/src/App.jsx`, find:
```js
const ALPHA_VANTAGE_KEY = 'demo'
```
Replace `demo` with your free API key from alphavantage.co

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login + receive JWT |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all user transactions |
| POST | `/api/transactions` | Add new transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/analytics` | Get full behavioral analytics |

### Budget
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budget` | Get all budget categories |
| POST | `/api/budget` | Add new category |
| PUT | `/api/budget/:id` | Update assigned amount |
| DELETE | `/api/budget/:id` | Delete category |

### Stocks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks` | Get portfolio with live P&L |
| POST | `/api/stocks` | Add new stock |
| PUT | `/api/stocks/:id` | Update current price |
| DELETE | `/api/stocks/:id` | Remove from portfolio |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | Get reminders with days-until |
| POST | `/api/reminders` | Create reminder |
| PUT | `/api/reminders/:id` | Mark paid / update |
| DELETE | `/api/reminders/:id` | Delete reminder |

---

## 🔒 Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens expire after 7 days
- Every API route verifies JWT before responding
- Every database query filters by `userId` — users can never access each other's data
- Sensitive UI sections (Trading, Accounts) protected by user-set 4-digit PINs
- PINs stored in localStorage, sections auto-lock on navigation
- `.env` file excluded from version control

---

## 👨‍💻 Author

**T. VAISHNAV**   
FINVERSE

---

## 📄 License

This project is built for academic purposes.  
All financial formulas used are based on standard personal finance benchmarks.

---

> *Every financial decision you make today is either an investment or an expense.  
> FINVERSE makes sure you know which one it actually was.*
