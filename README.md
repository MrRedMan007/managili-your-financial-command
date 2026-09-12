# Managili: Your Financial Command

MANAGILI — MASTER LOVABLE BUILD PROMPT

Copy this entire document into Lovable as the initial build prompt.

A. Product Overview

Build Managili — "Manage for me" — a personal financial operating system. It gives a user complete visibility, control, and intelligent understanding of their financial life: accounts, transactions, transfers, budgets, savings goals, debts/loans, bills/recurring payments, assets, net worth, and deterministic financial insights, in one coherent system (not a spreadsheet, not a simple expense tracker).

B. Product Goals

Give the user an immediate, accurate answer to "how much money do I have, where is it, and am I okay?"

Make recording a transaction fast enough to compete with pen-and-paper ("spent 5 TND on coffee" in under 5 seconds).

Keep financial truth (balances, net worth) deterministic and auditable — never guessed, never LLM-generated.

Be architected from day one for multiple users, even though the first user is the founder himself.

C. Target Users

V1: a single power user (the founder) managing personal finances in TND, expecting to extend usage to other people later without a rebuild. Design every schema and permission model as if multi-tenant from day one.

D. V1 Scope (build now)

Multi-account tracking (cash, bank, savings, e-wallet, custom types), multi-currency per account

Transactions: income, expense, transfer, with categories/subcategories, merchants, payment methods, notes/tags

Budgets: monthly, overall + per-category, with warnings

Savings goals: target + deadline, contributions/withdrawals, progress forecast, multiple goals with priority

Debts & loans (both directions): partial repayments, due dates, overdue flagging

Recurring transactions / bills / subscriptions: pending→confirm posting model, upcoming-occurrence view, overdue flagging on missed occurrences

Assets: manual value tracking

Investment accounts: balance-line only (full schema, minimal UI)

Net worth: always visible, monthly historical snapshots

Deterministic financial insights (see Section Z) with a global on/off toggle

In-app notification center

Auth via Supabase email/password, strict row-level security

Data export (CSV/JSON), self-serve account deletion

Full i18n architecture + RTL, English + Arabic content at launch

Search, filtering, basic reports/charts

Responsive (mobile/tablet/desktop), PWA-ready, dark/light/system theme

Quick Add flow for fast transaction entry

E. Future Architecture (schema/hooks now, feature later — do NOT build the UI)

Custom budget periods (weekly/custom) beyond monthly; budget rollover

Interest tracking on debts/loans

Full investment holdings UI: cost basis, current value, P&L, returns

LLM-generated narrative insights (e.g. "your food spending increased significantly")

Anomaly detection on transactions

Push/email notifications

French language content (i18n architecture must already support adding it with zero code changes)

F. Explicitly Out of Scope (do not build, do not architect for yet)

CSV/bank statement import and transaction deduplication

Live brokerage/market-data/bank integrations

Any feature not listed in Section D or E

G. Technology Stack

Frontend: React + TypeScript, Tailwind CSS

Backend/DB/Auth: Supabase (Postgres, Auth, Row-Level Security, Storage)

Charts: a lightweight charting library (e.g. Recharts) for dashboard/report visuals

State: React Query or equivalent for server-state caching

All monetary values stored as integers in minor currency units (e.g. millimes for TND) to avoid floating-point rounding errors — never store money as float/double.

H. Database Schema

Design normalized Postgres tables with RLS policies scoping every row to user_id = auth.uid(). Minimum entities:

users (managed by Supabase Auth) / profiles (display name, base currency, locale, theme preference, AI-insights toggle)

accounts (id, user_id, name, type [cash/bank/savings/e-wallet/investment/custom], currency, starting_balance, current_balance [derived/cached], is_archived, notes, created_at)

currencies (code, name, symbol)

exchange_rates (from_currency, to_currency, rate, effective_date) — manual entry in V1

categories (id, user_id, name, parent_category_id [nullable, for subcategories], type [income/expense], icon, is_default)

merchants (id, user_id, name, last_used_category_id) — for autocomplete/memory

transactions (id, user_id, account_id, type [income/expense], category_id, merchant_id, amount [integer, minor units], currency, occurred_at, notes, tags[], payment_method, is_recurring_instance, recurring_id [nullable], created_at, updated_at)

transfers (id, user_id, from_account_id, to_account_id, amount_from, amount_to, currency_from, currency_to, exchange_rate_used, occurred_at, notes) — never appears in income/expense reports

budgets (id, user_id, category_id [nullable = overall budget], period_type [monthly in V1], amount, period_start)

savings_goals (id, user_id, name, target_amount, current_amount [derived], target_date, priority, is_archived)

savings_contributions (id, goal_id, amount, direction [contribution/withdrawal], occurred_at)

debts (id, user_id, direction [owed_by_me/owed_to_me], counterparty_name, principal_amount, remaining_amount [derived], due_date, status [open/partially_paid/settled/overdue])

debt_payments (id, debt_id, amount, occurred_at)

recurring_transactions (id, user_id, account_id, type, category_id, amount, currency, frequency, next_occurrence_date, status [active/paused], last_generated_occurrence_id)

recurring_occurrences (id, recurring_id, expected_date, status [pending/confirmed/overdue/skipped], linked_transaction_id [nullable])

assets (id, user_id, name, category, acquisition_value, current_value, acquisition_date, notes)

investment_accounts (id, user_id, account_id, holding_summary_note) — schema only, minimal UI in V1

net_worth_snapshots (id, user_id, snapshot_date, total_assets, total_liabilities, net_worth) — generated monthly

notifications (id, user_id, type, title, body, is_read, created_at, related_entity_id)

financial_insights (id, user_id, type, message, severity, generated_at, is_dismissed) — deterministic only in V1

user_preferences (user_id, language, theme, ai_insights_enabled, notification_prefs)

I. Key Relationships & Constraints

A transaction always belongs to exactly one account and affects that account's balance by ± its amount.

A transfer affects exactly two accounts' balances and must never be counted in income/expense totals or category reports.

accounts.current_balance is a derived/cached value, recalculated from starting_balance + all transactions/transfers affecting that account — never edited directly by the user.

Deleting a transaction reverses its balance effect; editing a transaction recalculates affected balances; both must preserve historical report accuracy for periods already reported on (store enough audit trail — at minimum updated_at and a change is never silently invisible in reports run before vs. after the edit).

A recurring occurrence in pending status does NOT affect balances until confirmed/posted, at which point a real transaction row is created and linked back via linked_transaction_id.

debts.remaining_amount and savings_goals.current_amount are derived from their payment/contribution tables, not stored as free-editable fields.

Net worth = SUM(account balances converted to base currency) + SUM(asset current values) − SUM(debts.remaining_amount where direction = owed_by_me).

All currency conversions for reporting use the exchange rate in effect at effective_date; never mutate a historical transaction's original currency/amount when the base currency changes.

J. Financial Business Logic — Edge Cases to Handle Correctly

Editing an expense recalculates the account balance and any reports covering that period going forward.

Archiving an account hides it from Quick Add and dashboards but preserves its transaction history and keeps it in historical net-worth calculations for past snapshots.

Deleting a transaction reverses its balance impact immediately; deleting an account with transactions requires explicit confirmation and either cascades (with warning) or is blocked until reassigned — pick blocked-until-reassigned as the safer default.

A currency-to-currency transfer stores both leg amounts and the rate used at the time; it is never later "corrected" retroactively.

If an exchange rate changes, only future transactions/reports use the new rate; past transactions keep the rate that was in effect.

A missed recurring occurrence (expected date passed, not confirmed) flips to overdue and generates a notification; it does not silently disappear.

A partially repaid debt keeps status = partially_paid and shows both original principal and remaining amount.

If an account balance goes negative, allow it (real-world overdrafts/credit happen) but visually flag it.

If an asset's value is updated, only the current snapshot changes; historical net-worth snapshots are untouched (append-only).

Account deletion by the user (self-serve) requires a confirmation step and either full data export prompt or explicit "delete everything" acknowledgment.

Importing/duplicate transactions: out of scope for V1 (no import feature), so no dedup logic is required yet — do not build it.

K. Authentication & Authorization

Supabase email/password auth. Email verification required before full app access.

Every table with user data has RLS policies restricting all operations to auth.uid() = user_id.

No client-side trust of any financial calculation used for authorization decisions — RLS is the enforcement boundary, not the UI.

L. Security

All financial mutations go through validated server-side logic (Supabase functions/RPC where calculations matter, e.g. balance recalculation), not naive client-side writes for anything affecting derived balances.

Input validation on all amount fields (must be a valid positive integer in minor units; reject negative amounts except where a field is explicitly signed).

No secrets in client code; use Supabase environment configuration.

Data export produces a complete, user-readable copy of their own data (CSV or JSON) on request.

M. Navigation

Primary navigation (responsive: bottom nav on mobile, sidebar on desktop):

Dashboard (home)

Transactions (list, search, filter, add)

Accounts

Budgets

Goals & Debts (tabbed: Savings Goals / Debts & Loans)

Bills & Recurring

Reports

Settings (profile, currency, language, theme, AI-insights toggle, notifications, data export, account deletion)

A persistent Quick Add action (floating action button on mobile, prominent button on desktop) is available from every screen.

N. Page-by-Page Specifications

Dashboard

Information hierarchy, top to bottom:

Total available money (sum of liquid account balances in base currency) + net worth summary

Account balances (compact list/cards, tap to drill in)

This period's income vs. expense (with remaining budget indicator)

Upcoming bills/recurring occurrences (next 7 days)

Savings goals progress (compact)

Deterministic insights/alerts (dismissable cards)

Recent transactions (last 5–10, link to full list)

Do not put every metric above the fold — use progressive disclosure (expandable sections/drill-down pages) rather than one dense screen.

Transactions

List view with search (text/merchant/amount), filters (category, account, date range, type), infinite scroll or pagination. Tapping a transaction opens edit view. Quick Add is accessible from here too.

Accounts

Grid/list of account cards (name, type, balance, currency). Add/edit/archive account flows. Tapping an account shows its transaction history and a balance-over-time mini chart.

Budgets

List of active budgets (overall + per-category) with progress bars (spent/remaining), color-coded (approaching/over threshold uses the red accent meaningfully, not decoratively). Add/edit budget flow.

Goals & Debts

Tab 1 — Savings Goals: cards with target, current amount, progress bar, forecasted completion date, contribute/withdraw actions. Tab 2 — Debts & Loans: two sections (I owe / owed to me), each row shows counterparty, remaining amount, due date, status badge (open/partially paid/overdue/settled), record-payment action.

Bills & Recurring

List of recurring items (income and expenses) with next occurrence date, frequency, and status. Upcoming-occurrences view distinct from the setup/management view. Confirm/post action on pending occurrences; manual "mark overdue as paid" flow.

Reports

Category breakdown (current period), income vs. expense trend chart, net-worth trend chart (from monthly snapshots), export button.

Settings

Profile, base currency, language (English/Arabic at launch, French-ready), theme, AI-insights master toggle with a plain-language description of what it does and does not do, notification preferences, data export, account deletion (with confirmation flow).

O. Dashboard — Business Logic Note

All dashboard numbers must be computed from the same derived-balance logic used everywhere else — no separately maintained "dashboard totals" that can drift out of sync with the accounts/transactions tables.

P. Transaction System

Quick Add flow: single screen/modal — amount, type (income/expense/transfer toggle), account, category (with recently-used suggestions first), optional merchant (autocomplete from history), optional note. Defaults to today's date and last-used account. Submitting immediately updates the relevant balance.

Q. Account System

See Sections H/I. Support starting balance entry only at account creation; balance changes afterward only via transactions/transfers, never a manual "edit balance" field (to preserve source-of-truth integrity). If the user needs to correct a balance, they record an adjustment transaction with a category like "Balance Correction."

R. Budget System

Monthly period only in V1. A budget with category_id = null is the overall/whole-wallet budget. Progress = sum of expense transactions in that category (or all expenses, if overall) within the current period ÷ budget amount. Warning threshold at 80% and 100% (configurable later, fixed at 80/100 in V1).

S. Savings System

Progress = sum of contributions − sum of withdrawals for that goal. Forecast = (target_amount − current_amount) ÷ average monthly contribution rate over the last 3 months, projected forward to a target date — a simple deterministic linear projection, not AI.

T. Debt/Loan System

remaining_amount = principal_amount − sum of payments. Status auto-derived: open (no payments, due date future), partially_paid (some payments, balance remains), overdue (due date passed, balance remains), settled (balance = 0).

U. Bills/Subscriptions

Modeled as recurring_transactions with type = expense. Frequency options: daily/weekly/monthly/yearly/custom interval. Generates recurring_occurrences ahead of time (e.g. next 3 occurrences visible) with pending status until confirmed.

V. Assets/Investments

Assets: manual CRUD with current value editable at any time (each edit is a point-in-time update, not versioned in V1 beyond updated_at). Investment accounts: schema present (investment_accounts linked 1:1 to an accounts row of type investment), but V1 UI only shows it as a balance line — no holdings/transactions UI yet.

W. Net Worth

Computed live for "current" view (Section I formula) and snapshotted monthly via a scheduled job into net_worth_snapshots for the historical trend chart. Snapshots are append-only and never recalculated retroactively when past data changes (preserves the fact that "at that time, this is what we believed").

X. Currency System

Every account has a currency. Every transaction is recorded in its account's currency. A base/display currency is set per user for aggregate views (dashboard totals, net worth), using the exchange rate in effect at the time of aggregation for current views, and the rate stored on the transaction/transfer for historical ones. Never destructively convert stored amounts.

Y. Analytics

Category breakdown, income vs. expense over time, month-over-month comparison, net-worth trend — all computed from stored transaction/snapshot data, no AI involved.

Z. AI / Financial Intelligence (V1 = deterministic only)

Build ONLY these, all calculated in code (not an LLM call):

Spending vs. recent average ("You spent X% more/less this week than your recent average")

Budget percentage warnings

Upcoming bills/obligations summary

Safe-to-spend estimate (available balance minus upcoming committed recurring expenses)

Cash-flow/savings-goal forecast (simple linear projection, see Section S)

Net-worth change summary ("Your net worth increased/decreased by X this month")

Requirements:

A single global toggle in Settings turns all of these off/on.

Every insight card is labeled clearly as an automated observation, not professional financial advice.

Do NOT wire up an actual LLM API call in V1 — leave a clean, documented seam (e.g. an insights service module) where Level 2 can later swap in an LLM-generated narrative layer without restructuring the app.

AA. Notifications

In-app notification center only in V1 (no push/email). Notification types: bill due soon, bill overdue, budget threshold reached, goal milestone reached, net-worth snapshot ready. Mark-as-read functionality.

AB. Search / Filtering

Transaction search by free text (matches merchant, notes, category name) and amount. Filters: category, account, date range, type (income/expense/transfer). Combine search + filters.

AC. Import / Export

Export only in V1: user can export their full transaction history (and ideally accounts/budgets/goals) as CSV and/or JSON from Settings. No import feature — do not build any import UI or parsing logic.

AD. Localization

Full i18n architecture (all UI strings externalized to translation files/keys) covering English, French, and Arabic from the start, even though French content is not written yet — adding French later must require zero code changes, just translation entries. Number, date, and currency formatting must respect the active locale.

AE. Arabic RTL

Arabic must be a fully functional RTL layout in V1 — mirrored navigation, correctly aligned forms, charts and numbers still read left-to-right for digits per standard convention, icons that imply direction (arrows, chevrons) flipped appropriately.

AF. Responsive Design

Mobile-first. Breakpoints for mobile/tablet/desktop. Bottom navigation on mobile, sidebar on desktop. Touch targets sized appropriately on mobile. PWA manifest + service worker for installability (offline data caching is not required in V1, just installability).

AG. Accessibility

Sufficient color contrast (especially for the red accent on dark backgrounds), keyboard navigability for all interactive elements, semantic HTML/ARIA labels on forms and charts, focus states visible.

AH. Loading / Error / Empty States

Every list/dashboard section needs a defined loading skeleton, an empty state with a clear call-to-action (e.g. "No transactions yet — add your first one"), and an error state with a retry action. Do not leave any data-fetching view without all three states designed.

AI. Validation

All amount inputs: positive integers in minor currency units, required. Dates: cannot be nonsensical (e.g. due date before creation date flagged, not blocked outright unless clearly invalid). Required fields enforced both client-side (UX) and server-side (integrity, via RLS/DB constraints where feasible).

AJ. Seed / Demo Data

On first login, offer to seed a small set of realistic demo data (a couple of accounts, ~15–20 sample transactions across categories, one budget, one savings goal, one recurring bill) so the dashboard and reports aren't empty on first look. Must be clearly removable/resettable from Settings.

AK. Testing Requirements

Prioritize correctness of balance-affecting logic: unit-level checks (or at minimum manual test scenarios documented in code comments) for transaction add/edit/delete balance effects, transfer balance effects on both accounts, and derived fields (debt remaining, goal current amount, net worth).

AL. Performance

Paginate/virtualize long transaction lists. Cache derived balances rather than recomputing from full transaction history on every render (recalculate incrementally on mutation, not via full table scan on each page load).

AM. Deployment

Standard Lovable + Supabase deployment. Ensure environment configuration keeps Supabase keys out of client-exposed source where Lovable's conventions allow.

AN. Future SaaS Readiness

Every table already scoped by user_id with RLS (Section H/K) — this is the main SaaS-readiness requirement, and it's already built into V1's schema. No additional multi-tenancy work should be needed to onboard a second user later.

AO. Explicit "DO NOT" Constraints

Do NOT store money as floating-point; use integer minor units.

Do NOT let transfers appear in income/expense totals or category reports.

Do NOT allow manual editing of derived fields (current_balance, remaining_amount, current_amount on goals) — only allow them to change via their source transactions/payments/contributions.

Do NOT wire up a real LLM call for insights in V1 — deterministic only, with a seam left for later.

Do NOT build CSV/bank import, live brokerage integration, push/email notifications, interest-on-debt calculations, budget rollover, or custom budget periods in V1 — schema hooks only where noted, otherwise skip entirely.

Do NOT retroactively mutate historical transactions, exchange rates used, or net-worth snapshots when current settings (base currency, category structure) change.

Do NOT put every dashboard metric on one dense screen — use hierarchy and drill-down.

Do NOT skip RLS on any table containing user data.

Build a coherent, production-oriented V1 with clean architecture and reusable components. Do not build a superficial prototype, and do not implement the deferred/future items listed above — build the foundation correctly so they can be activated later without a rebuild.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/04b31d7e-6b7b-4aaf-b007-af563c1fa925).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
