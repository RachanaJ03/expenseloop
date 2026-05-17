# Pocket Expense Tracker

A modern personal expense tracker built with React, TanStack Start, Vite, and Tailwind CSS.

## Features

- Add, edit, and delete income and expense transactions
- Real-time summary cards for balance, income, and spending
- Interactive charts to visualize spending trends
- AI-backed insights when a valid `LOVABLE_API_KEY` is configured
- Profile page with currency and language preferences
- Local browser storage for transaction data

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- TanStack React Router
- TanStack React Start
- Supabase integration
- Lovable AI gateway for insights (optional)

## Getting Started

### Prerequisites

- Node.js 18+ / npm 10+
- Git

### Install dependencies

```bash
cd "C:\Users\racha\Downloads\expenseloop-main\expenseloop-main"
npm install
```

### Configure environment variables

Copy `.env.example` to `.env` and add your environment values.

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
copy .env.example .env
```

Update `.env` with your Supabase and Lovable values.

Required values:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

Optional AI insights:

```env
LOVABLE_API_KEY="your_lovable_api_key_here"
```

If `LOVABLE_API_KEY` is not configured or invalid, the app will fall back to local insights instead of calling the Lovable API.

## Run the app

```bash
npm run dev
```

Then open:

```text
http://localhost:8080/
```

## Build for production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

- `src/` — application source code
  - `routes/` — page routes
  - `components/` — UI and expense feature components
  - `integrations/` — Supabase integration code
  - `lib/` — shared utilities, store, insights logic
- `.env.example` — sample environment variables
- `vite.config.ts` — Vite configuration
- `package.json` — scripts and dependencies

## Notes

- Transaction data is stored locally in the browser.
- Cloud sync and OCR features are not implemented yet.
- AI insights require a valid `LOVABLE_API_KEY` for gateway calls; otherwise local insights are displayed.

## License

This repository is currently private and intended for personal use.
