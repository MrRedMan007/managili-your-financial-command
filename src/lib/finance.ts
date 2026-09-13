import type { Database } from "@/integrations/supabase/types";

export type TableName = keyof Database["public"]["Tables"];
export type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];

export type FinanceData = {
  accounts: Row<"accounts">[];
  assets: Row<"assets">[];
  budgets: Row<"budgets">[];
  categories: Row<"categories">[];
  currencies: Row<"currencies">[];
  debts: Row<"debts">[];
  financialInsights: Row<"financial_insights">[];
  goals: Row<"savings_goals">[];
  netWorthSnapshots: Row<"net_worth_snapshots">[];
  notifications: Row<"notifications">[];
  occurrences: Row<"recurring_occurrences">[];
  recurring: Row<"recurring_transactions">[];
  transactions: Row<"transactions">[];
  transfers: Row<"transfers">[];
  profile: Row<"profiles"> | null;
  preferences: Row<"user_preferences"> | null;
};

export function formatMoney(amount: number, currency = "TND", locale = "en") {
  const digits = currency === "TND" ? 3 : 2;
  return new Intl.NumberFormat(locale === "ar" ? "ar-TN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount / 10 ** digits);
}

export function parseMoney(value: string, currency = "TND") {
  const digits = currency === "TND" ? 3 : 2;
  return Math.round(Number(value.replace(",", ".")) * 10 ** digits);
}

export function monthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
}

export function isThisMonth(value: string) {
  return value.slice(0, 7) === new Date().toISOString().slice(0, 7);
}

export function accountTotal(data: FinanceData) {
  return data.accounts.filter((a) => !a.is_archived && a.type !== "investment").reduce((sum, a) => sum + a.current_balance, 0);
}

export function netWorth(data: FinanceData) {
  const accounts = data.accounts.filter((a) => !a.is_archived).reduce((sum, a) => sum + a.current_balance, 0);
  const assets = data.assets.reduce((sum, a) => sum + a.current_value, 0);
  const liabilities = data.debts.filter((d) => d.direction === "owed_by_me").reduce((sum, d) => sum + d.remaining_amount, 0);
  return accounts + assets - liabilities;
}

export function monthFlow(data: FinanceData) {
  return data.transactions.filter((t) => isThisMonth(t.occurred_at)).reduce(
    (totals, t) => ({ ...totals, [t.type]: totals[t.type] + t.amount }),
    { income: 0, expense: 0 },
  );
}

export function categoryName(data: FinanceData, id: string | null) {
  return data.categories.find((category) => category.id === id)?.name ?? "Uncategorized";
}

export function accountName(data: FinanceData, id: string) {
  return data.accounts.find((account) => account.id === id)?.name ?? "Account";
}
