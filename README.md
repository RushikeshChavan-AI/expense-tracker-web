# AI Expense Tracker

A modern, minimal, glassmorphic expense tracker built with React 19 and Vite. Track income and expenses, visualize spending with charts, and add transactions just by describing them in plain English — powered by the OpenAI API.

Authentication and account-specific data storage are powered by Supabase, so each user gets their own transactions and categories.

---

## ✨ Features

- **Dashboard** — current balance, total income/expenses, monthly summary, top spending category, recent transactions, and an animated balance gauge.
- **Transactions** — add, edit, delete, search, filter, sort, and paginate every transaction in one place.
- **Income & Expenses** — dedicated views for each transaction type with full history.
- **Categories** — 10 built-in categories (Food, Transport, Shopping, Bills, Entertainment, Health, Education, Salary, Freelance, Other) plus support for unlimited custom categories with your own name, color, and icon.
- **AI Assistant** — type things like *"I spent ₹500 on food today"* or *"Received salary ₹25000"* and the assistant detects the type, amount, category, date, and description, then shows a confirmation card before saving anything.
- **Analytics** — pie chart of category spending, bar chart of monthly income vs. expenses, and a running balance trend line.
- **CSV Export / Import** — back up your transactions to CSV or import them from a previous export.
- **Supabase Auth & database** — sign up, sign in, and keep each user's data isolated with row-level security.
- **Polished UI** — glassmorphism, responsive layout, sidebar navigation, modals, toast notifications, skeleton loaders, and empty states.

---

## 🛠 Tech Stack

| Layer            | Choice                          |
|-------------------|----------------------------------|
| Framework          | React 19 + Vite                 |
| Language           | JavaScript (no TypeScript)       |
| Styling            | Tailwind CSS v4                 |
| Routing            | React Router                     |
| Charts             | Recharts                        |
| Icons              | Lucide React                    |
| HTTP client        | Axios                           |
| AI                 | OpenAI Chat Completions API      |
| Auth & Persistence | Supabase                         |

---

## 🚀 Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure Supabase and optional AI settings
cp .env.example .env
# then open .env and set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
# optionally set VITE_OPENAI_API_KEY=sk-...

# 3. Create the Supabase tables and RLS policies
# Option A: Run supabase/schema.sql in your Supabase project's SQL Editor.
# Option B: Add SUPABASE_DB_URL to .env, then run:
npm run supabase:init

# 4. Start the dev server
npm run dev
```

The app runs at `http://localhost:5173` by default. The AI Assistant page works without an OpenAI API key too; it will simply explain that a key is needed before it can parse messages.

### Other scripts

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build locally
npm run lint      # lint the project
```

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── auth/            # Protected route wrapper
│   ├── ai/              # AI chat message & confirmation card
│   ├── categories/      # Category card & form
│   ├── charts/          # Pie / bar / line chart wrappers
│   ├── dashboard/       # Stat cards, balance orb, quick actions, recent list
│   ├── layout/          # Sidebar, Navbar, Footer
│   ├── transactions/    # Transaction table, form, filters, shared list page
│   └── ui/               # Button, Input, Select, Modal, Loader, Skeleton,
│                          # EmptyState, Toast, ConfirmDialog (reusable primitives)
├── context/              # AuthContext, AppContext, and ToastContext
├── data/                 # Sample seed data helpers
├── hooks/                # Analytics and filtered transaction hooks
├── layouts/              # MainLayout (sidebar + navbar + outlet)
├── pages/                # Auth, Dashboard, Transactions, Income, Expenses,
│                          # Categories, AIAssistant, Settings, NotFound
├── services/              # aiService, csvService, Supabase data service
├── utils/                # constants, formatters, category-icon map
├── App.jsx                # Router setup
├── index.css              # Tailwind + design tokens
└── main.jsx                # Entry point
```

---

## 🖼 Screenshots

> Add your own screenshots here after running the app locally.

- `docs/screenshot-dashboard.png` — Dashboard overview
- `docs/screenshot-ai-assistant.png` — AI Assistant chat
- `docs/screenshot-transactions.png` — Transactions table with filters

---

## 🔑 Environment Variables

| Variable                | Description                                          |
|---------------------------|------------------------------------------------------|
| `VITE_SUPABASE_URL`       | Your Supabase project URL.                           |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key for browser-side access. |
| `VITE_SUPABASE_ANON_KEY`  | Optional fallback for legacy Supabase projects.      |
| `SUPABASE_DB_URL`         | Setup-only Postgres connection string for `npm run supabase:init`. Do not expose this in deployed frontend environments. |
| `VITE_OPENAI_API_KEY`     | Your OpenAI API key, used only by the AI Assistant. Never hardcoded — read from `import.meta.env` at runtime. |

Copy `.env.example` to `.env` and fill in your keys. The `.env` file is git-ignored by default.

Example:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Optional fallback for older Supabase projects.
VITE_SUPABASE_ANON_KEY=

# Local setup only. Never add this to Vercel, Netlify, or browser-hosted environments.
SUPABASE_DB_URL=postgresql://postgres.your-project-ref:your_database_password@aws-1-your-region.pooler.supabase.com:6543/postgres

# Optional. Needed only for AI parsing.
VITE_OPENAI_API_KEY=
```

### Supabase setup

1. Create a Supabase project.
2. Create the tables with either setup path:
   - In Supabase, open **SQL Editor** and run `supabase/schema.sql`.
   - Or add `SUPABASE_DB_URL` to `.env` and run `npm run supabase:init`.
3. In **Authentication > Providers**, keep Email enabled.
4. In your app `.env`, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Restart the dev server.

`SUPABASE_DB_URL` is only for the local Node setup script. Do not use it in browser code or expose it to deployed frontend environments.

---

## ☁️ Deployment

This is a static Vite app, so it deploys anywhere that serves static files. Vercel is the simplest path for this project.

### Deploy to Vercel

1. Push this repository to GitHub.
2. Open [Vercel New Project](https://vercel.com/new).
3. Import the GitHub repository.
4. Use these settings:

```text
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

5. Add these Vercel environment variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_OPENAI_API_KEY=
```

Do not add `SUPABASE_DB_URL` to Vercel. It is only for local database initialization.

6. Deploy.
7. In Supabase, open **Authentication > URL Configuration** and add your Vercel URL to the site URL and allowed redirect URLs.

Other static hosting options:

- **Netlify** — build command `npm run build`, publish directory `dist`.
- **Cloudflare Pages** — framework preset Vite, build command `npm run build`, output directory `dist`.
- **GitHub Pages** — possible, but less convenient for environment variables and client-side routing.

The Supabase publishable key is safe for browser use when row-level security is enabled. The OpenAI API key is exposed to the browser bundle at build time via Vite's `import.meta.env`; treat it like any client-exposed key and use appropriate rate/usage limits for production deployments.

---

## 🔮 Future Improvements

- Multi-currency support
- Budgets and spending goals per category
- Recurring transactions
- Dark/light theme toggle
- Voice input for the AI Assistant
- Export to PDF reports

---

Built as a portfolio-quality demo project. Enjoy tracking your money! 💰
