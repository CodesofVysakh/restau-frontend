"use client";
import { useState } from "react";
import { Order, OrderStatus, ORDER_STATUS_TRANSITIONS } from "@/types";
import { formatPrice, timeAgo } from "@/lib/session";
import { clsx } from "clsx";

const STATUS_STYLE: Record<OrderStatus, string> = {
    [OrderStatus.RECEIVED]: "bg-blue-50 text-blue-700 border-blue-200",
    [OrderStatus.PREPARING]: "bg-amber-50 text-amber-700 border-amber-200",
    [OrderStatus.READY]: "bg-green-50 text-green-700 border-green-200",
    [OrderStatus.COMPLETED]: "bg-stone-100 text-stone-500 border-stone-200",
};
const STATUS_ICON: Record<OrderStatus, string> = {
    [OrderStatus.RECEIVED]: "📋",
    [OrderStatus.PREPARING]: "🔥",
    [OrderStatus.READY]: "🔔",
    [OrderStatus.COMPLETED]: "✅",
};
const NEXT_LABEL: Record<OrderStatus, string> = {
    [OrderStatus.RECEIVED]: "Start preparing",
    [OrderStatus.PREPARING]: "Mark as ready",
    [OrderStatus.READY]: "Mark completed",
    [OrderStatus.COMPLETED]: "",
};

export function KitchenOrderCard({
    order,
    onAdvance,
}: {
    order: Order;
    onAdvance: (id: string, s: string) => Promise<void>;
}) {
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const next = ORDER_STATUS_TRANSITIONS[order.status][0];

    async function handle() {
        if (!next) return;
        setBusy(true);
        setErr("");
        try {
            await onAdvance(order.id, next);
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    }

    const isNew = order.status === OrderStatus.RECEIVED;
    const isReady = order.status === OrderStatus.READY;
    const isDone = order.status === OrderStatus.COMPLETED;

    return (
        <div
            className={clsx(
                "bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300",
                isNew && "border-blue-300 ring-2 ring-blue-100",
                isReady && "border-green-400 ring-2 ring-green-100",
                !isNew && !isReady && "border-stone-100",
                isDone && "opacity-60",
            )}
        >
            <div className="px-4 py-3 flex items-center justify-between border-b border-stone-100 bg-stone-50">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{STATUS_ICON[order.status]}</span>
                    <div>
                        <p className="font-bold text-sm">
                            Table {order.tableNumber}
                        </p>
                        <p className="text-xs text-stone-400">
                            #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                            {timeAgo(order.placedAt)}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span
                        className={clsx(
                            "text-xs font-semibold px-2 py-0.5 rounded-full border",
                            STATUS_STYLE[order.status],
                        )}
                    >
                        {order.status}
                    </span>
                    <span className="text-xs font-medium text-stone-500">
                        {formatPrice(order.total)}
                    </span>
                </div>
            </div>

            <div className="px-4 py-3 space-y-2">
                {order.items.map((item) => (
                    <div key={item.id} className="flex gap-2">
                        <span className="w-5 h-5 bg-[#C8410A] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {item.quantity}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{item.name}</p>
                            {item.customizations.map((c) => (
                                <p
                                    key={c.id}
                                    className="text-xs text-stone-400"
                                >
                                    {c.label}
                                </p>
                            ))}
                            {item.specialInstructions && (
                                <p className="text-xs text-[#C8410A] font-medium mt-0.5 bg-orange-50 px-2 py-0.5 rounded">
                                    ⚠️ {item.specialInstructions}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {err && <p className="text-xs text-red-600 px-4 pb-2">{err}</p>}

            {next && (
                <div className="px-4 pb-4">
                    <button
                        onClick={handle}
                        disabled={busy}
                        className={clsx(
                            "w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                            isReady
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-[#C8410A] hover:bg-[#A33508] text-white",
                        )}
                    >
                        {busy ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg
                                    className="animate-spin h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    />
                                </svg>
                                Updating…
                            </span>
                        ) : (
                            NEXT_LABEL[order.status]
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
