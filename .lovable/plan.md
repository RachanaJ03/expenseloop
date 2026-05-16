# Expense Tracker — Build Plan

This is a large scope. I'll build it in phases so you can review as it grows. Phase 1 ships a beautiful, working app; later phases layer on cloud, AI, and OCR.

## Design direction
- Modern fintech-inspired UI: dark mode by default with light toggle, soft gradients, glassy cards, generous spacing.
- Accent: emerald (income) / rose (expense) on deep slate background.
- Typography: Inter / Space Grotesk pair.
- Smooth Motion-driven micro-interactions on add/delete.

## Phase 1 — Core app (no backend)
- Dashboard: balance, income, expense cards with animated counters
- Add/edit/delete transactions with date+time picker
- 15+ categories (Food, Transport, Rent, Shopping, Bills, Health, Entertainment, Travel, Education, Salary, Freelance, Investment, Gift, Subscription, Other…) with icons
- 30+ currency selector (USD, EUR, GBP, INR, JPY, etc.) with proper formatting
- Filters: by category, date range, type, search
- Charts: spending by category (donut), income vs expense over time (area), monthly trend (bar) — Recharts
- Built-in calculator (popover from the amount field)
- Dark / light mode toggle
- LocalStorage persistence so it works immediately

## Phase 2 — Lovable Cloud (auth + sync)
- Enable Lovable Cloud
- Email/password + Google sign-in
- `profiles` table (avatar, display name, preferred currency, language)
- `transactions` table with RLS scoped to `auth.uid()`
- Profile page: upload avatar (Storage), pick currency, pick language (EN/ES/FR/DE/HI to start)
- Migrate local data to cloud on first login

## Phase 3 — Exports & receipts
- Export filtered data to CSV, Excel (xlsx), PDF report
- Upload receipt photos to Storage, attach to transaction
- OCR via Lovable AI (Gemini vision) to auto-extract amount, date, merchant

## Phase 4 — AI insights
- Monthly insights panel: "You spent 20% more on Food vs last month"
- Saving tips generated from spending profile
- Anomaly detection (flag unusual transactions)
- Powered by Lovable AI Gateway (`google/gemini-3-flash-preview`)

## Technical notes
- TanStack Start + Tailwind + shadcn (already scaffolded)
- Recharts for charts, date-fns for dates, zod for validation
- All colors via semantic tokens in `src/styles.css`
- Phase 2+ requires enabling Lovable Cloud (I'll do it when we get there)

---

Reply **"go"** to start Phase 1 now, or tell me which phases to prioritize / skip.
