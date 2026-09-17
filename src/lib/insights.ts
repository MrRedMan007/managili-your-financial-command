import { accountTotal, isThisMonth, monthFlow, netWorth, type FinanceData } from "./finance";

export type DeterministicInsight = {
  id: string;
  message: string;
  severity: "info" | "warning" | "critical";
};

// Keep insight generation behind this pure interface so a future provider can
// replace it without changing dashboard rendering or financial calculations.
export function generateDeterministicInsights(data: FinanceData): DeterministicInsight[] {
  const insights: DeterministicInsight[] = [];
  const flow = monthFlow(data);
  const overall = data.budgets.find((budget) => !budget.category_id && isThisMonth(budget.period_start));
  const pendingBills = data.occurrences
    .filter((occurrence) => occurrence.status === "pending" || occurrence.status === "overdue")
    .reduce((sum, occurrence) => sum + (data.recurring.find((rule) => rule.id === occurrence.recurring_id)?.amount ?? 0), 0);

  if (overall) {
    const ratio = Math.round((flow.expense / overall.amount) * 100);
    if (ratio >= 100) insights.push({ id: "budget-exceeded", message: `Monthly spending is ${ratio}% of your overall budget.`, severity: "critical" });
    else if (ratio >= 80) insights.push({ id: "budget-warning", message: `You have used ${ratio}% of your monthly budget.`, severity: "warning" });
  }
  if (data.accounts.some((account) => account.current_balance < 0)) {
    insights.push({ id: "negative-balance", message: "One or more accounts have a negative balance.", severity: "critical" });
  }
  if (pendingBills > 0) {
    insights.push({ id: "upcoming-bills", message: "Pending bills are reserved in your safe-to-spend figure.", severity: "info" });
  }
  insights.push({ id: "safe-to-spend", message: `Safe to spend after pending bills: ${Math.max(0, accountTotal(data) - pendingBills)} minor units.`, severity: "info" });
  const snapshots = [...data.netWorthSnapshots].sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date));
  if (snapshots[0]) {
    const change = netWorth(data) - snapshots[0].net_worth;
    insights.push({ id: "net-worth-change", message: `Net worth changed by ${change} minor units since the latest snapshot.`, severity: change < 0 ? "warning" : "info" });
  }
  return insights;
}