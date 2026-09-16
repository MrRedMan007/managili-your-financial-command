import { createFileRoute } from "@tanstack/react-router";
import { financeQuery } from "@/lib/finance-data";
import { ReportsPage } from "@/components/managili/screens";
import { PageSkeleton } from "@/components/managili/states";
import { RouteError, RouteNotFound } from "@/components/managili/page";
export const Route=createFileRoute("/_authenticated/reports")({loader:({context})=>context.queryClient.ensureQueryData(financeQuery),pendingComponent:PageSkeleton,errorComponent:RouteError,notFoundComponent:RouteNotFound,head:()=>({meta:[{title:"Reports — Managili"},{name:"description",content:"Analyze cash flow, categories, and net-worth trends."},{property:"og:title",content:"Reports — Managili"},{property:"og:description",content:"Analyze cash flow, categories, and net-worth trends."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:ReportsPage});
