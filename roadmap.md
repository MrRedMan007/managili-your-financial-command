# Managili — build roadmap

## Design
- [ ] Dark near-black theme, red accent (action/warning/highlight), green only for positive amounts
- [ ] Port "Soft instrument ledger" layout composition (Space Grotesk display, Inter body, JetBrains Mono numerals, rounded-3xl cards, sidebar/topbar nav + Quick Add)

## Backend (Lovable Cloud)
- [ ] Enable Cloud
- [ ] Schema + RLS + GRANTs: profiles, user_preferences, currencies, exchange_rates, accounts, categories, merchants, transactions, transfers, budgets, savings_goals, savings_contributions, debts, debt_payments, recurring_transactions, recurring_occurrences, assets, investment_accounts, net_worth_snapshots, notifications, financial_insights
- [ ] Derived balances via triggers/RPC (integer minor units only)
- [ ] Demo seed + reset RPC

## Frontend
- [ ] Auth (email/password, verification)
- [ ] Dashboard, Transactions, Accounts, Budgets, Goals & Debts, Bills & Recurring, Reports, Settings
- [ ] Quick Add everywhere
- [ ] Deterministic insights service module (no LLM)
- [ ] Notification center
- [ ] i18n (en/ar + fr-ready) + RTL
- [ ] Export CSV/JSON, account deletion
- [ ] Loading/empty/error states everywhere, PWA manifest
