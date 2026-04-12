"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { useKitchenOrders } from "@/hooks";
import { KitchenOrderCard } from "@/components/kitchen/KitchenOrderCard";
import { OrderCardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { Order, OrderStatus } from "@/types";

const COLS: { status: OrderStatus; label: string; emoji: string }[] = [
    { status: OrderStatus.RECEIVED, label: "Incoming", emoji: "📋" },
    { status: OrderStatus.PREPARING, label: "Preparing", emoji: "🔥" },
    { status: OrderStatus.READY, label: "Ready", emoji: "🔔" },
    { status: OrderStatus.COMPLETED, label: "Completed", emoji: "✅" },
];

/** Groups orders by table number, sorted by earliest order in each group. */
function groupByTable(
    orders: Order[],
): Array<{ table: string; orders: Order[] }> {
    const map: Record<string, Order[]> = {};
    for (const order of orders) {
        const key = order.tableNumber || "Unknown";
        if (!map[key]) map[key] = [];
        map[key].push(order);
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([table, orders]) => ({ table, orders }));
}

export default function KitchenDashboard() {
    const router = useRouter();
    const { token, username, isAuthenticated, clearAuth } = useAuthStore();
    const { orders, isLoading, error, advanceStatus } = useKitchenOrders();

    useEffect(() => {
        if (!isAuthenticated || !token) {
            router.replace("/login");
            return;
        }
        api.useToken(token);
    }, [isAuthenticated, token, router]);

    if (!isAuthenticated) return null;

    const activeCount = orders.filter(
        (o) => o.status !== OrderStatus.COMPLETED,
    ).length;

    return (
        <div className="min-h-screen bg-[#1A1410] text-white">
            {/* Header */}
            <header className="bg-[#2D2420] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <h1
                        style={{ fontFamily: "'Playfair Display',serif" }}
                        className="text-[#F0C050] text-xl font-bold"
                    >
                        EMBER
                    </h1>
                    <span className="text-stone-400 text-sm">
                        Kitchen Dashboard
                    </span>
                    {activeCount > 0 && (
                        <span className="bg-[#C8410A] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {activeCount} active
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-stone-400">Live</span>
                    </div>
                    <span className="text-xs text-stone-500">{username}</span>
                    <button
                        onClick={() => {
                            clearAuth();
                            api.logout();
                            router.push("/login");
                        }}
                        className="text-xs text-stone-400 hover:text-white px-2 py-1 border border-white/10 rounded-md hover:border-white/30 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </header>

            {error && (
                <div className="mx-6 mt-4 bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                    ⚠️ {error}
                </div>
            )}

            {/* Kanban board */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {COLS.map(({ status, label, emoji }) => {
                    const colOrders = orders.filter((o) => o.status === status);
                    const tableGroups = groupByTable(colOrders);

                    return (
                        <div key={status} className="flex flex-col gap-3">
                            {/* Column header */}
                            <div className="flex items-center gap-2 px-1">
                                <span>{emoji}</span>
                                <span className="font-semibold text-sm text-stone-300">
                                    {label}
                                </span>
                                <span className="ml-auto text-xs bg-white/10 text-stone-400 rounded-full px-2 py-0.5">
                                    {colOrders.length}
                                </span>
                            </div>

                            {/* Empty column */}
                            {isLoading ? (
                                <>
                                    <OrderCardSkeleton />
                                    <OrderCardSkeleton />
                                </>
                            ) : tableGroups.length === 0 ? (
                                <div className="border border-dashed border-white/10 rounded-xl h-24 flex items-center justify-center text-stone-600 text-sm">
                                    No orders
                                </div>
                            ) : (
                                /* Table groups within this column */
                                tableGroups.map(
                                    ({ table, orders: tableOrders }) => (
                                        <div key={table} className="space-y-2">
                                            {/* Table label — only show if more than one table present in column */}
                                            {tableGroups.length > 1 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-[#F0C050] bg-[#2D2420] px-2 py-0.5 rounded-full border border-[#F0C050]/20">
                                                        Table {table}
                                                    </span>
                                                    <div className="flex-1 h-px bg-white/10" />
                                                    {tableOrders.length > 1 && (
                                                        <span className="text-xs text-stone-500">
                                                            {tableOrders.length}{" "}
                                                            orders
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {/* Cards for this table */}
                                            {tableOrders.map((order) => (
                                                <KitchenOrderCard
                                                    key={order.id}
                                                    order={order}
                                                    onAdvance={advanceStatus}
                                                    showTableLabel={
                                                        tableGroups.length === 1
                                                    }
                                                />
                                            ))}
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
