"use client";
import { useParams, useRouter } from "next/navigation";
import { useOrderTracker } from "@/hooks";
import { StatusStepper } from "@/components/order/StatusStepper";
import { formatPrice, formatTime } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { OrderStatus } from "@/types";

const BANNERS: Record<OrderStatus, { emoji: string; msg: string }> = {
    [OrderStatus.RECEIVED]: {
        emoji: "✅",
        msg: "Order confirmed! Kitchen has received it.",
    },
    [OrderStatus.PREPARING]: {
        emoji: "👨‍🍳",
        msg: "Chef's working on it — won't be long!",
    },
    [OrderStatus.READY]: {
        emoji: "🔔",
        msg: "Your food is ready! Bringing it over now.",
    },
    [OrderStatus.COMPLETED]: {
        emoji: "🎉",
        msg: "Order complete. Enjoy your meal!",
    },
};

export default function TrackPage() {
    const { orderId } = useParams() as { orderId: string };
    const router = useRouter();
    const { order, isLoading, error } = useOrderTracker(orderId);

    if (isLoading)
        return (
            <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#C8410A]/30 border-t-[#C8410A] rounded-full animate-spin" />
                    <p className="text-[#6B5E57] text-sm">
                        Loading your order…
                    </p>
                </div>
            </div>
        );

    if (error || !order)
        return (
            <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center gap-4 p-6">
                <div className="text-5xl">⚠️</div>
                <h2 className="font-bold text-xl">Order not found</h2>
                <p className="text-[#6B5E57] text-sm">{error}</p>
                <Button onClick={() => router.push("/menu")}>
                    Back to menu
                </Button>
            </div>
        );

    const banner = BANNERS[order.status];
    const isReady = order.status === OrderStatus.READY;
    const isDone = order.status === OrderStatus.COMPLETED;

    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            <header className="bg-[#1A1410] h-16 flex items-center justify-between px-4">
                <h1
                    style={{ fontFamily: "'Playfair Display',serif" }}
                    className="text-[#F0C050] text-xl font-bold"
                >
                    EMBER
                </h1>
                <span className="text-stone-400 text-sm">
                    Table {order.tableNumber}
                </span>
            </header>

            <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
                <div
                    className={`rounded-2xl p-5 text-center transition-all duration-500 ${isReady ? "bg-green-50 border-2 border-green-400" : isDone ? "bg-stone-100 border border-stone-200" : "bg-white border border-stone-100 shadow-sm"}`}
                >
                    <div className="text-4xl mb-2">{banner.emoji}</div>
                    <h2 className="font-bold text-lg">{banner.msg}</h2>
                    <p className="text-xs text-stone-400 mt-1">
                        Live updates — no refresh needed
                    </p>
                    {!isDone && (
                        <div className="flex items-center justify-center gap-1.5 mt-3">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-700 font-medium">
                                Live tracking active
                            </span>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5">
                    <StatusStepper status={order.status} />
                </div>

                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-stone-100 flex justify-between items-center">
                        <h3 className="font-semibold">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <span className="text-xs text-stone-400">
                            {formatTime(order.placedAt)}
                        </span>
                    </div>
                    <div className="divide-y divide-stone-50">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="px-5 py-3 flex justify-between items-start"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {item.quantity}× {item.name}
                                    </p>
                                    {item.customizations.map((c) => (
                                        <p
                                            key={c.id}
                                            className="text-xs text-stone-400"
                                        >
                                            {c.label}
                                        </p>
                                    ))}
                                    {item.specialInstructions && (
                                        <p className="text-xs text-stone-400 italic">
                                            "{item.specialInstructions}"
                                        </p>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-[#C8410A]">
                                    {formatPrice(item.itemTotal)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 space-y-1 text-sm">
                        <div className="flex justify-between text-[#6B5E57]">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[#6B5E57]">
                            <span>Tax</span>
                            <span>{formatPrice(order.tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Total paid</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                    <h3 className="font-semibold text-sm mb-3">
                        Status history
                    </h3>
                    <div className="space-y-2">
                        {order.statusHistory.map((h) => (
                            <div
                                key={h.id}
                                className="flex items-center gap-3 text-sm"
                            >
                                <span className="w-2 h-2 bg-[#C8410A] rounded-full flex-shrink-0" />
                                <span className="font-medium capitalize">
                                    {h.status.toLowerCase()}
                                </span>
                                <span className="text-stone-400 text-xs ml-auto">
                                    {formatTime(h.changedAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push("/menu")}
                >
                    Order more items
                </Button>
            </div>
        </div>
    );
}
