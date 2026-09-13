import { useState } from "react";
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Plus } from "lucide-react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { financeQuery } from "@/lib/finance-data";
import { parseMoney } from "@/lib/finance";
import { supabase } from "@/integrations/supabase/client";

type EntryType = "expense" | "income" | "transfer";
export function QuickAdd({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EntryType>("expense");
  const { data } = useSuspenseQuery(financeQuery);
  const queryClient = useQueryClient();
  const activeAccounts = data.accounts.filter((account) => !account.is_archived);
  const categories = data.categories.filter((category) => category.type === type);
  const mutation = useMutation({
    mutationFn: async (form: FormData) => {
      const accountId = String(form.get("account"));
      const account = activeAccounts.find((item) => item.id === accountId);
      if (!account) throw new Error("Choose an account");
      const amount = parseMoney(String(form.get("amount")), account.currency);
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Enter a valid positive amount");
      const occurred_at = new Date(String(form.get("date")) + "T12:00:00").toISOString();
      if (type === "transfer") {
        const toId = String(form.get("toAccount"));
        const destination = activeAccounts.find((item) => item.id === toId);
        if (!destination || destination.id === accountId) throw new Error("Choose a different destination");
        const { error } = await supabase.from("transfers").insert({ from_account_id: accountId, to_account_id: destination.id, amount_from: amount, amount_to: parseMoney(String(form.get("toAmount") || form.get("amount")), destination.currency), currency_from: account.currency, currency_to: destination.currency, exchange_rate_used: Number(form.get("rate") || 1), occurred_at, notes: String(form.get("note") || "") || null });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("transactions").insert({ account_id: accountId, type, category_id: String(form.get("category") || "") || null, amount, currency: account.currency, occurred_at, notes: String(form.get("note") || "") || null, payment_method: String(form.get("paymentMethod") || "") || null, tags: [] });
        if (error) throw error;
      }
    },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["finance"] }); setOpen(false); },
  });
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button size={compact ? "icon" : "default"} className={compact ? "size-14 rounded-full shadow-xl" : "w-full justify-start"}><Plus/>{!compact && "Quick add"}</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-popover sm:max-w-xl">
      <DialogHeader><DialogTitle>Quick add</DialogTitle><DialogDescription>Record money in seconds. Balances update automatically.</DialogDescription></DialogHeader>
      <div className="grid grid-cols-3 gap-2">{(["expense","income","transfer"] as EntryType[]).map((item) => <Button key={item} type="button" variant={type === item ? "default" : "outline"} onClick={() => setType(item)}>{item === "expense" ? <ArrowUpRight/> : item === "income" ? <ArrowDownLeft/> : <ArrowRightLeft/>}{item}</Button>)}</div>
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(new FormData(event.currentTarget)); }}>
        <Field label="Amount"><Input name="amount" inputMode="decimal" placeholder="0.000" required autoFocus /></Field>
        <Field label="Account"><select name="account" required className="field"><option value="">Select account</option>{activeAccounts.map(a=><option key={a.id} value={a.id}>{a.name} · {a.currency}</option>)}</select></Field>
        {type === "transfer" ? <><Field label="To account"><select name="toAccount" required className="field"><option value="">Select destination</option>{activeAccounts.map(a=><option key={a.id} value={a.id}>{a.name} · {a.currency}</option>)}</select></Field><Field label="Destination amount"><Input name="toAmount" inputMode="decimal" placeholder="Same as amount" /></Field><Field label="Exchange rate"><Input name="rate" inputMode="decimal" defaultValue="1" /></Field></> : <Field label="Category"><select name="category" className="field"><option value="">Uncategorized</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}
        <div className="grid grid-cols-2 gap-3"><Field label="Date"><Input name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)} required /></Field>{type !== "transfer" && <Field label="Payment method"><Input name="paymentMethod" placeholder="Cash, card…" /></Field>}</div>
        <Field label="Note"><Input name="note" placeholder="Optional note" /></Field>
        {mutation.error && <p className="text-sm text-negative" role="alert">{mutation.error.message}</p>}
        <Button disabled={mutation.isPending} className="mt-2">{mutation.isPending ? "Saving…" : "Save entry"}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="grid gap-2"><Label>{label}</Label>{children}</div>; }
