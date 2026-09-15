import { createFileRoute } from "@tanstack/react-router";
import { financeQuery } from "@/lib/finance-data";
import { DashboardPage } from "@/components/managili/dashboard";
import { PageSkeleton } from "@/components/managili/states";
import { RouteError, RouteNotFound } from "@/components/managili/page";
export const Route=createFileRoute("/_authenticated/dashboard")({loader:({context})=>context.queryClient.ensureQueryData(financeQuery),pendingComponent:PageSkeleton,errorComponent:RouteError,notFoundComponent:RouteNotFound,head:()=>({meta:[{title:"Dashboard — Managili"},{name:"description",content:"See available money, net worth, cash flow, budgets, bills, goals, and recent activity."},{property:"og:title",content:"Dashboard — Managili"},{property:"og:description",content:"Your complete financial position at a glance."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:DashboardPage});
