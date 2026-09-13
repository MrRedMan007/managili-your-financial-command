# Managili frontend build

## Goal
Build the complete signed-in Managili V1 interface on the existing Lovable Cloud data model, without changing the database schema. The result will use the approved near-black ledger layout, red for actions/warnings/negative values, and green only for positive money.

## App foundation
- Add email/password sign-in, verification messaging, sign-out, and a protected application area.
- Create a responsive shell with desktop sidebar, mobile bottom navigation, notification center, and persistent Quick Add.
- Establish semantic dark/light/system theme tokens, Space Grotesk headings, Inter body text, JetBrains Mono/tabular money, accessible focus states, and responsive layouts.
- Add English and Arabic translations with live locale switching, full RTL mirroring, locale-aware dates/currency, and LTR financial numerals.
- Use shared loading skeletons, empty prompts, retry states, confirmations, and form validation across every data view.

## Data and financial logic
- Add typed authenticated data functions and cached queries for all existing tables; all writes remain user-scoped and use the existing balance/debt/goal database logic.
- Centralize integer-minor-unit formatting/parsing, currency conversion, date periods, and report aggregations.
- Add a deterministic insights module for spending comparisons, budget thresholds, upcoming bills, safe-to-spend, goal forecasts, and net-worth movement; no AI calls.
- Keep transfers excluded from income/expense and category totals, and prevent direct editing of derived balances.

## Screens
- **Dashboard:** available money and net worth, account balances, current-period cash flow and budget, upcoming bills, compact goals, dismissible observations, and recent transactions.
- **Transactions:** paginated searchable/filterable ledger, add/edit/delete income and expenses, transfer flow, merchant memory, tags, payment method, and transaction details.
- **Accounts:** account cards, create/edit/archive, account detail with history and balance trend, plus minimal investment balance treatment.
- **Budgets:** monthly overall/category budgets with spending progress, 80% warning and 100% exceeded states, plus add/edit flows.
- **Goals & Debts:** tabbed savings goals and debts; contribution/withdrawal, payment recording, deterministic forecasts, due/status indicators, and archive/settled states.
- **Bills & Recurring:** separate upcoming-occurrence and recurring-rule views, create/edit/pause controls, confirm/post, skip, and overdue-paid handling.
- **Reports:** category breakdown, income-versus-expense trend, month comparison, net-worth snapshots, filters, and CSV/JSON export.
- **Settings:** profile, base currency, exchange rates, language, theme, deterministic-observation toggle, notification preferences, categories, assets, data export, demo-data seed/reset, and confirmed account deletion.

## Interaction and verification
- Quick Add supports expense, income, and transfer from every screen, defaults to today, remembers recent choices, and refreshes affected balances immediately after successful writes.
- Notification actions support mark read and mark all read.
- Add the PWA manifest/install metadata and route-specific page metadata.
- Verify sign-in and core create/edit flows, financial totals, filters, desktop/mobile layouts, Arabic RTL, loading/empty/error states, and console/network cleanliness.

## Technical details
- Use TanStack Router protected routes, TanStack Query caching, generated Lovable Cloud clients, existing authenticated middleware, Recharts, React Hook Form, and Zod.
- Build reusable shell, money, chart, status, form, dialog, and list primitives rather than duplicating page logic.
- Do not add or alter tables, columns, policies, functions, triggers, or seed SQL.
