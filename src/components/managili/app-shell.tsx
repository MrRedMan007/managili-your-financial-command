import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Bell, ChartNoAxesCombined, CircleDollarSign, CreditCard, Gauge, Landmark, LogOut, Menu, ReceiptText, Settings, Target, WalletCards, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickAdd } from "./quick-add";
import { financeQuery } from "@/lib/finance-data";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const nav = [
  ["/dashboard", "dashboard", Gauge], ["/transactions", "transactions", ReceiptText], ["/accounts", "accounts", WalletCards], ["/budgets", "budgets", CircleDollarSign], ["/goals", "goals", Target], ["/bills", "bills", CreditCard], ["/reports", "reports", ChartNoAxesCombined], ["/settings", "settings", Settings],
] as const;
export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const { data } = useSuspenseQuery(financeQuery);
  const unread = data.notifications.filter(n=>!n.is_read);
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = async () => { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); };
  const sidebar = <><div className="flex h-20 items-center gap-3 border-b border-border px-5"><div className="grid size-9 place-items-center bg-primary text-primary-foreground"><Landmark className="size-5"/></div><div><div className="font-display text-lg font-semibold">MANAGILI</div><div className="text-[10px] uppercase text-muted-foreground">Personal finance OS</div></div></div><nav className="flex-1 space-y-1 p-3">{nav.map(([to,key,Icon])=><Link key={to} to={to} onClick={()=>setMenuOpen(false)} activeProps={{className:"bg-sidebar-accent text-foreground before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:bg-primary"}} className="relative flex h-11 items-center gap-3 px-3 text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"><Icon className="size-4"/><span>{t(key)}</span></Link>)}</nav><div className="space-y-3 border-t border-border p-3"><QuickAdd/><Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={signOut}><LogOut/>{t("signOut")}</Button></div></>;
  return <div className="min-h-screen bg-background"><aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col border-e border-border bg-sidebar lg:flex">{sidebar}</aside><div className="lg:ps-64"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-8"><Button variant="ghost" size="icon" className="lg:hidden" onClick={()=>setMenuOpen(true)} aria-label="Open navigation"><Menu/></Button><div className="hidden text-xs uppercase text-muted-foreground sm:block">{new Intl.DateTimeFormat(undefined,{weekday:"long",month:"long",day:"numeric"}).format(new Date())}</div><div className="relative"><Button variant="ghost" size="icon" onClick={()=>setNoticesOpen(v=>!v)} aria-label="Notifications"><Bell/>{unread.length>0&&<span className="absolute end-1 top-1 size-2 rounded-full bg-primary"/>}</Button>{noticesOpen&&<div className="absolute end-0 top-12 z-50 w-[min(360px,90vw)] border border-border bg-popover p-3 shadow-2xl"><div className="mb-3 flex items-center justify-between"><strong>{t("notifications")}</strong><span className="text-xs text-muted-foreground">{unread.length} unread</span></div>{data.notifications.slice(0,5).map(n=><div key={n.id} className="border-t border-border py-3"><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-muted-foreground">{n.body}</p></div>)}{!data.notifications.length&&<p className="py-6 text-center text-sm text-muted-foreground">You're all caught up.</p>}</div>}</div></header><main className="mx-auto max-w-[1500px] p-4 pb-28 md:p-8 lg:pb-8">{children}</main></div>
  <div className={cn("fixed inset-0 z-50 bg-background transition-transform lg:hidden",menuOpen?"translate-x-0":"-translate-x-full rtl:translate-x-full")}><div className="flex h-full flex-col">{sidebar}</div><Button variant="ghost" size="icon" className="absolute end-3 top-5" onClick={()=>setMenuOpen(false)}><X/></Button></div>
  <div className="fixed bottom-20 end-5 z-40 lg:hidden"><QuickAdd compact/></div><nav className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 border-t border-border bg-sidebar lg:hidden">{nav.slice(0,4).map(([to,key,Icon])=><Link key={to} to={to} activeProps={{className:"text-primary"}} className="flex flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground"><Icon className="size-4"/>{t(key)}</Link>)}<button className="flex flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground" onClick={()=>setMenuOpen(true)}><Menu className="size-4"/>More</button></nav></div>;
}
