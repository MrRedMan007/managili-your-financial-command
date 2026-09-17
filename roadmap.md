# Managili — build roadmap

## Design
- [x] Dark near-black theme, red accent (action/warning/highlight), green only for positive amounts
- [x] Port "Soft instrument ledger" layout composition (Space Grotesk display, Inter body, JetBrains Mono numerals, rounded-3xl cards, sidebar/topbar nav + Quick Add)

## Backend (Lovable Cloud)
- [x] Enable Cloud
- [x] Schema + RLS + GRANTs: profiles, user_preferences, currencies, exchange_rates, accounts, categories, merchants, transactions, transfers, budgets, savings_goals, savings_contributions, debts, debt_payments, recurring_transactions, recurring_occurrences, assets, investment_accounts, net_worth_snapshots, notifications, financial_insights
- [x] Derived balances via triggers/RPC (integer minor units only)
- [x] Demo seed + reset RPC

## Frontend
- [x] Auth (email/password, verification)
- [x] Dashboard, Transactions, Accounts, Budgets, Goals & Debts, Bills & Recurring, Reports, Settings
- [x] Quick Add everywhere
- [x] Deterministic insights service module (no LLM)
- [x] Notification center
- [x] i18n (en/ar + fr-ready) + RTL
- [x] Export CSV/JSON, account deletion
- [x] Loading/empty/error states everywhere, PWA manifest
