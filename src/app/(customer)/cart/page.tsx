"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore, useUiStore } from "@/store";
import { useCart } from "@/hooks";
import { api } from "@/lib/api";
import { getSessionId, formatPrice } from "@/lib/session";
import { Button } from "@/components/ui/Button";

type Step = "review" | "payment" | "processing";

export default function CartPage() {
    const router = useRouter();
    const { cart, clearCart } = useCartStore();
    const { tableNumber } = useUiStore();
    const { updateItem } = useCart();
    const [step, setStep] = useState<Step>("review");
    const [card, setCard] = useState("");
    const [err, setErr] = useState("");
    const [busy, setBusy] = useState(false);

    if (!cart || cart.items.length === 0)
        return (
            <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center gap-4 p-6">
                <div className="text-5xl">🛒</div>
                <h2 className="font-bold text-xl">Your cart is empty</h2>
                <Button onClick={() => router.push("/menu")}>
                    Browse the menu
                </Button>
            </div>
        );

    async function handleOrder() {
        if (!card || card.length !== 4) {
            setErr("Please enter the last 4 digits of your card");
            return;
        }
        if (!tableNumber) {
            setErr("Please set your table number first");
            return;
        }
        setErr("");
        setBusy(true);
        setStep("processing");
        try {
            const order = await api.placeOrder({
                sessionId: getSessionId(),
                tableNumber,
                cardLastFour: card,
            });
            clearCart();
            router.push(`/track/${order.id}`);
        } catch (e: any) {
            setErr(e.message ?? "Order failed. Please try again.");
            setStep("payment");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            <header className="bg-[#1A1410] h-16 flex items-center px-4 gap-4">
                <button
                    onClick={() => router.push("/menu")}
                    className="text-stone-400 hover:text-white text-sm"
                >
                    ← Back
                </button>
                <h1
                    style={{ fontFamily: "'Playfair Display',serif" }}
                    className="text-[#F0C050] text-xl font-bold"
                >
                    {step === "processing" ? "Processing…" : "Checkout"}
                </h1>
            </header>

            {step === "processing" ? (
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <div className="w-12 h-12 border-4 border-[#C8410A]/30 border-t-[#C8410A] rounded-full animate-spin" />
                    <p className="text-[#6B5E57]">Processing your payment…</p>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                    {tableNumber && (
                        <div className="bg-[#C8410A]/10 border border-[#C8410A]/20 rounded-xl px-4 py-3 flex items-center gap-2">
                            <span className="text-[#C8410A]">🪑</span>
                            <span className="text-sm font-medium">
                                Table {tableNumber}
                            </span>
                        </div>
                    )}

                    {cart.priceDrift && cart.priceDrift.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="font-semibold text-amber-800 text-sm mb-2">
                                ⚠️ Some prices changed since you added items
                            </p>
                            {cart.priceDrift.map((d) => (
                                <p
                                    key={d.menuItemId}
                                    className="text-sm text-amber-700"
                                >
                                    {d.name}: {formatPrice(d.cartPrice)} →{" "}
                                    {formatPrice(d.currentPrice)}
                                </p>
                            ))}
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-stone-100">
                            <h2 className="font-bold">Order summary</h2>
                        </div>
                        <div className="divide-y divide-stone-50">
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-3 px-5 py-4"
                                >
                                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">
                                            {item.name}
                                        </p>
                                        {item.customizations.map((c) => (
                                            <p
                                                key={c.optionId}
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
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex items-center border border-stone-200 rounded-md overflow-hidden">
                                                <button
                                                    onClick={() =>
                                                        updateItem(
                                                            item.id,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="w-7 h-7 text-sm flex items-center justify-center hover:bg-stone-50"
                                                >
                                                    {item.quantity === 1
                                                        ? "🗑"
                                                        : "−"}
                                                </button>
                                                <span className="w-7 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateItem(
                                                            item.id,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    className="w-7 h-7 text-sm flex items-center justify-center hover:bg-stone-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-sm text-[#C8410A] flex-shrink-0">
                                        {formatPrice(item.itemTotal)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="px-5 py-4 bg-stone-50 border-t border-stone-100 space-y-1.5 text-sm">
                            <div className="flex justify-between text-[#6B5E57]">
                                <span>Subtotal</span>
                                <span>{formatPrice(cart.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-[#6B5E57]">
                                <span>Tax (8%)</span>
                                <span>{formatPrice(cart.tax)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base pt-2 border-t border-stone-200">
                                <span>Total</span>
                                <span>{formatPrice(cart.total)}</span>
                            </div>
                        </div>
                    </div>

                    {step === "payment" && (
                        <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4">
                            <h2 className="font-bold">Payment</h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                                💳 Mock payment — any 4 digits. Use{" "}
                                <strong>0000</strong> to simulate a declined
                                card.
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1.5">
                                    Last 4 digits of card
                                </label>
                                <input
                                    type="text"
                                    value={card}
                                    onChange={(e) =>
                                        setCard(
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 4),
                                        )
                                    }
                                    placeholder="1234"
                                    maxLength={4}
                                    className="w-full px-4 py-3 border border-stone-200 rounded-lg text-xl text-center tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-[#C8410A]/30"
                                />
                            </div>
                            {err && (
                                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                                    {err}
                                </p>
                            )}
                            <Button
                                onClick={handleOrder}
                                isLoading={busy}
                                size="lg"
                                className="w-full"
                            >
                                Pay {formatPrice(cart.total)}
                            </Button>
                        </div>
                    )}
                    {step === "review" && (
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={() => setStep("payment")}
                        >
                            Continue to payment
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
