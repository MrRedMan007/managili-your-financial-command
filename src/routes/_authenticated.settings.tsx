import { createFileRoute } from "@tanstack/react-router";
import { financeQuery } from "@/lib/finance-data";
import { SettingsPage } from "@/components/managili/screens";
import { PageSkeleton } from "@/components/managili/states";
import { RouteError, RouteNotFound } from "@/components/managili/page";
export const Route=createFileRoute("/_authenticated/settings")({loader:({context})=>context.queryClient.ensureQueryData(financeQuery),pendingComponent:PageSkeleton,errorComponent:RouteError,notFoundComponent:RouteNotFound,head:()=>({meta:[{title:"Settings — Managili"},{name:"description",content:"Manage your Managili profile, preferences, data, and exports."},{property:"og:title",content:"Settings — Managili"},{property:"og:description",content:"Manage your Managili profile, preferences, data, and exports."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:SettingsPage});
