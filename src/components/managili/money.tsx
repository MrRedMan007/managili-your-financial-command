import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/finance";
import { useI18n } from "@/lib/i18n";
export function Money({ amount, currency = "TND", signed, className }: { amount: number; currency?: string; signed?: boolean; className?: string }) {
  const { language } = useI18n();
  const tone = signed ? amount > 0 ? "text-positive" : amount < 0 ? "text-negative" : "text-foreground" : "text-foreground";
  return <span dir="ltr" className={cn("font-mono tabular-nums", tone, className)}>{signed && amount > 0 ? "+" : ""}{formatMoney(amount, currency, language)}</span>;
}
