import { createFileRoute } from "@tanstack/react-router";
import { financeQuery } from "@/lib/finance-data";
import { GoalsPage } from "@/components/managili/screens";
import { PageSkeleton } from "@/components/managili/states";
import { RouteError, RouteNotFound } from "@/components/managili/page";
export const Route=createFileRoute("/_authenticated/goals")({loader:({context})=>context.queryClient.ensureQueryData(financeQuery),pendingComponent:PageSkeleton,errorComponent:RouteError,notFoundComponent:RouteNotFound,head:()=>({meta:[{title:"Goals & Debts — Managili"},{name:"description",content:"Track savings goals, debts, loans, contributions, and payments."},{property:"og:title",content:"Goals & Debts — Managili"},{property:"og:description",content:"Track savings goals, debts, loans, contributions, and payments."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:GoalsPage});
