import { createFileRoute } from "@tanstack/react-router";
import { financeQuery } from "@/lib/finance-data";
import { AccountsPage } from "@/components/managili/screens";
import { PageSkeleton } from "@/components/managili/states";
import { RouteError, RouteNotFound } from "@/components/managili/page";
export const Route=createFileRoute("/_authenticated/accounts")({loader:({context})=>context.queryClient.ensureQueryData(financeQuery),pendingComponent:PageSkeleton,errorComponent:RouteError,notFoundComponent:RouteNotFound,head:()=>({meta:[{title:"Accounts — Managili"},{name:"description",content:"Track every cash, bank, savings, wallet, and investment balance."},{property:"og:title",content:"Accounts — Managili"},{property:"og:description",content:"Track every cash, bank, savings, wallet, and investment balance."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:AccountsPage});
