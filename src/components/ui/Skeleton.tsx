import { clsx } from "clsx";
export function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={clsx("animate-pulse bg-stone-200 rounded", className)}
            role="status"
            aria-label="Loading..."
        />
    );
}
export function MenuItemSkeleton() {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-stone-100">
            <Skeleton className="w-full h-48" />
            <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between pt-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
export function OrderCardSkeleton() {
    return (
        <div className="bg-white rounded-xl p-5 border border-stone-100 space-y-3">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-9 w-full rounded-lg mt-2" />
        </div>
    );
}
