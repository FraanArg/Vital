import { cn } from "../../lib/utils";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted/20", className)}
            {...props}
        />
    )
}

// Log card skeleton
function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("bg-card rounded-xl border border-border/30 p-4", className)}>
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-2 w-16 rounded" />
                </div>
                <Skeleton className="h-6 w-12 rounded" />
            </div>
        </div>
    );
}

// Activity ring skeleton
function SkeletonRing({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-2 w-16 rounded" />
        </div>
    );
}

// Chart skeleton
function SkeletonChart({ className }: { className?: string }) {
    return (
        <div className={cn("bg-card rounded-xl border border-border/30 p-4", className)}>
            <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="ml-auto h-6 w-20 rounded" />
            </div>
            <div className="flex items-end gap-1 h-32">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1 rounded-t"
                        style={{ height: `${30 + Math.random() * 70}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

// Stats grid skeleton
function SkeletonStats({ className }: { className?: string }) {
    return (
        <div className={cn("grid grid-cols-2 gap-3", className)}>
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border/30 p-4">
                    <Skeleton className="h-3 w-16 rounded mb-2" />
                    <Skeleton className="h-6 w-12 rounded" />
                </div>
            ))}
        </div>
    );
}

export { Skeleton, SkeletonCard, SkeletonRing, SkeletonChart, SkeletonStats }
