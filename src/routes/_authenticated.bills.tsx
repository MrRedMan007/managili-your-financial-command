import { createFileRoute } from "@tanstack/react-router";
import { financeQuery } from "@/lib/finance-data";
import { BillsPage } from "@/components/managili/screens";
import { PageSkeleton } from "@/components/managili/states";
import { RouteError, RouteNotFound } from "@/components/managili/page";
export const Route=createFileRoute("/_authenticated/bills")({loader:({context})=>context.queryClient.ensureQueryData(financeQuery),pendingComponent:PageSkeleton,errorComponent:RouteError,notFoundComponent:RouteNotFound,head:()=>({meta:[{title:"Bills & Recurring — Managili"},{name:"description",content:"Review and confirm upcoming recurring bills."},{property:"og:title",content:"Bills & Recurring — Managili"},{property:"og:description",content:"Review and confirm upcoming recurring bills."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:BillsPage});
