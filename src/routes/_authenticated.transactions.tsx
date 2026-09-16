import { createFileRoute } from "@tanstack/react-router";
import { financeQuery } from "@/lib/finance-data";
import { TransactionsPage } from "@/components/managili/screens";
import { PageSkeleton } from "@/components/managili/states";
import { RouteError, RouteNotFound } from "@/components/managili/page";
export const Route=createFileRoute("/_authenticated/transactions")({loader:({context})=>context.queryClient.ensureQueryData(financeQuery),pendingComponent:PageSkeleton,errorComponent:RouteError,notFoundComponent:RouteNotFound,head:()=>({meta:[{title:"Transactions — Managili"},{name:"description",content:"Search, filter, and manage your complete financial ledger."},{property:"og:title",content:"Transactions — Managili"},{property:"og:description",content:"Search, filter, and manage your complete financial ledger."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:TransactionsPage});
