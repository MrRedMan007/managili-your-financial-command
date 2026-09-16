import { createFileRoute } from "@tanstack/react-router";
import { financeQuery } from "@/lib/finance-data";
import { BudgetsPage } from "@/components/managili/screens";
import { PageSkeleton } from "@/components/managili/states";
import { RouteError, RouteNotFound } from "@/components/managili/page";
export const Route=createFileRoute("/_authenticated/budgets")({loader:({context})=>context.queryClient.ensureQueryData(financeQuery),pendingComponent:PageSkeleton,errorComponent:RouteError,notFoundComponent:RouteNotFound,head:()=>({meta:[{title:"Budgets — Managili"},{name:"description",content:"Monitor monthly budgets and spending thresholds."},{property:"og:title",content:"Budgets — Managili"},{property:"og:description",content:"Monitor monthly budgets and spending thresholds."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:BudgetsPage});
