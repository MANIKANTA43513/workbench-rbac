import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function RoleCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3.5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border/60">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="w-44 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="flex-1 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-28 rounded-lg" />
    </div>
  );
}

export { Skeleton };
