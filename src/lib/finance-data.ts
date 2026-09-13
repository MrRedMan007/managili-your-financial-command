import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FinanceData, TableName } from "@/lib/finance";

async function rows<T extends TableName>(table: T) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  return data ?? [];
}

export async function getFinanceData(): Promise<FinanceData> {
  const [accounts, assets, budgets, categories, currencies, debts, financialInsights, goals, netWorthSnapshots, notifications, occurrences, recurring, transactions, transfers, profileRows, preferenceRows] = await Promise.all([
    rows("accounts"), rows("assets"), rows("budgets"), rows("categories"), rows("currencies"), rows("debts"), rows("financial_insights"), rows("savings_goals"), rows("net_worth_snapshots"), rows("notifications"), rows("recurring_occurrences"), rows("recurring_transactions"), rows("transactions"), rows("transfers"), rows("profiles"), rows("user_preferences"),
  ]);
  return { accounts, assets, budgets, categories, currencies, debts, financialInsights, goals, netWorthSnapshots, notifications, occurrences, recurring, transactions, transfers, profile: profileRows[0] ?? null, preferences: preferenceRows[0] ?? null } as FinanceData;
}
export const financeQuery = queryOptions({ queryKey: ["finance"], queryFn: getFinanceData, staleTime: 20_000 });
