"use client";
import { useRouter } from "next/navigation";
import { useSessionOrders } from "@/hooks";
import { StatusStepper } from "@/components/order/StatusStepper";
import { formatPrice, formatTime } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { OrderStatus, Order } from "@/types";
import { clsx } from "clsx";

const STATUS_COLOR: Record<OrderStatus, string> = {
    [OrderStatus.RECEIVED]: "bg-blue-50  border-blue-200  text-blue-700",
    [OrderStatus.PREPARING]: "bg-amber-50 border-amber-200 text-amber-700",
    [OrderStatus.READY]: "bg-green-50 border-green-400 text-green-700",
    [OrderStatus.COMPLETED]: "bg-stone-100 border-stone-200 text-stone-500",
};

const STATUS_EMOJI: Record<OrderStatus, string> = {
    [OrderStatus.RECEIVED]: "✅",
    [OrderStatus.PREPARING]: "👨‍🍳",
    [OrderStatus.READY]: "🔔",
    [OrderStatus.COMPLETED]: "🎉",
};

export default function OrdersPage() {
    const router = useRouter();
    const { orders, ordersByTable, isLoading, error, activeCount } =
        useSessionOrders();

    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            {/* Header */}
            <header className="bg-[#1A1410] sticky top-0 z-40">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/menu")}
                            className="text-stone-400 hover:text-white text-sm transition-colors"
                        >
                            ← Menu
                        </button>
                        <h1
                            style={{ fontFamily: "'Playfair Display',serif" }}
                            className="text-[#F0C050] text-xl font-bold"
                        >
                            EMBER
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeCount > 0 && (
                            <>
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs text-stone-400">
                                    {activeCount} active
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Page title */}
                <div className="mb-6">
                    <h2
                        style={{ fontFamily: "'Playfair Display',serif" }}
                        className="text-2xl font-bold text-[#1A1410]"
                    >
                        Your orders
                    </h2>
                    <p className="text-sm text-[#6B5E57] mt-1">
                        {activeCount > 0
                            ? `${activeCount} order${activeCount > 1 ? "s" : ""} in progress — live updates enabled`
                            : "All orders completed"}
                    </p>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-10 h-10 border-4 border-[#C8410A]/30 border-t-[#C8410A] rounded-full animate-spin" />
                        <p className="text-[#6B5E57] text-sm">
                            Loading your orders…
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && orders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <div className="text-5xl">🍽️</div>
                        <h3 className="font-bold text-lg text-[#1A1410]">
                            No orders yet
                        </h3>
                        <p className="text-[#6B5E57] text-sm">
                            Browse the menu and place your first order.
                        </p>
                        <Button onClick={() => router.push("/menu")}>
                            Browse menu
                        </Button>
                    </div>
                )}

                {/* Orders grouped by table */}
                {!isLoading &&
                    Object.entries(ordersByTable).map(
                        ([table, tableOrders]) => (
                            <div key={table} className="mb-8">
                                {/* Table header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center gap-2 bg-[#1A1410] text-[#F0C050] px-3 py-1 rounded-full">
                                        <span className="text-xs font-bold tracking-wider">
                                            TABLE {table}
                                        </span>
                                    </div>
                                    <div className="flex-1 h-px bg-stone-200" />
                                    <span className="text-xs text-stone-400">
                                        {tableOrders.length} order
                                        {tableOrders.length > 1 ? "s" : ""}
                                    </span>
                                </div>

                                {/* Order cards for this table */}
                                <div className="space-y-4">
                                    {tableOrders.map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                        />
                                    ))}
                                </div>
                            </div>
                        ),
                    )}

                {/* Order more button */}
                {!isLoading && orders.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-stone-200">
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => router.push("/menu")}
                        >
                            Order more items
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function OrderCard({ order }: { order: Order }) {
    const isReady = order.status === OrderStatus.READY;
    const isDone = order.status === OrderStatus.COMPLETED;

    return (
        <div
            className={clsx(
                "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300",
                isReady && "border-green-400 ring-2 ring-green-100",
                !isReady && "border-stone-100",
                isDone && "opacity-75",
            )}
        >
            {/* Card header */}
            <div
                className={clsx(
                    "px-5 py-3 flex items-center justify-between border-b border-stone-100",
                    isReady ? "bg-green-50" : "bg-stone-50",
                )}
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">
                        {STATUS_EMOJI[order.status]}
                    </span>
                    <div>
                        <p className="text-xs text-stone-400">
                            #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                            {formatTime(order.placedAt)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={clsx(
                            "text-xs font-semibold px-2 py-0.5 rounded-full border",
                            STATUS_COLOR[order.status],
                        )}
                    >
                        {order.status}
                    </span>
                    <span className="text-xs font-medium text-stone-500">
                        {formatPrice(order.total)}
                    </span>
                </div>
            </div>

            {/* Status stepper */}
            <div className="px-5">
                <StatusStepper status={order.status} />
            </div>

            {/* Items summary */}
            <div className="px-5 pb-4 border-t border-stone-50">
                <div className="pt-3 space-y-1.5">
                    {order.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between items-start text-sm"
                        >
                            <div className="flex-1 min-w-0">
                                <span className="font-medium text-[#1A1410]">
                                    {item.quantity}× {item.name}
                                </span>
                                {item.customizations.length > 0 && (
                                    <span className="text-xs text-stone-400 ml-1">
                                        (
                                        {item.customizations
                                            .map((c) => c.label)
                                            .join(", ")}
                                        )
                                    </span>
                                )}
                                {item.specialInstructions && (
                                    <p className="text-xs text-[#C8410A] mt-0.5">
                                        ⚠️ {item.specialInstructions}
                                    </p>
                                )}
                            </div>
                            <span className="text-sm font-medium text-[#C8410A] ml-3 flex-shrink-0">
                                {formatPrice(item.itemTotal)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="mt-3 pt-3 border-t border-stone-100 space-y-1 text-xs text-stone-400">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatPrice(order.tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-sm text-[#1A1410] pt-1">
                        <span>Total paid</span>
                        <span>{formatPrice(order.total)}</span>
                    </div>
                </div>
            </div>

            {/* Ready banner */}
            {isReady && (
                <div className="mx-5 mb-4 bg-green-600 text-white text-sm font-semibold text-center py-2.5 rounded-xl">
                    🔔 Your food is ready — bringing it over now!
                </div>
            )}
        </div>
    );
}
