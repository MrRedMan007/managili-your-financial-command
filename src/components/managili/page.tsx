import { useRouter } from "@tanstack/react-router";
import { ErrorState } from "./states";
export function PageHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <header className="mb-7 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-[10px] font-semibold uppercase text-primary">MANAGILI / {title}</p><h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p></div>{action}</header>; }
export function RouteError() { const router=useRouter(); return <ErrorState retry={()=>router.invalidate()}/>; }
export const RouteNotFound=()=> <div className="p-8 text-muted-foreground">This financial view is not available.</div>;
