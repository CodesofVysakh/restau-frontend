"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore, useUiStore } from "@/store";
import { useCart } from "@/hooks";
import { formatPrice } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { PriceDriftItem } from "@/types";

export function CartDrawer() {
    const router = useRouter();
    const { cart, isCartOpen, closeCart, openCart } = useCartStore();
    const { tableNumber } = useUiStore();
    const { updateItem, isLoading } = useCart();

    if (!isCartOpen) return null;
    const count = cart?.itemCount ?? 0;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={closeCart}
            />
            <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                    <div>
                        <h2 className="font-bold text-lg">Your order</h2>
                        {tableNumber && (
                            <p className="text-xs text-[#6B5E57]">
                                Table {tableNumber}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={closeCart}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800"
                    >
                        ✕
                    </button>
                </div>

                {cart?.priceDrift && cart.priceDrift.length > 0 && (
                    <PriceDriftBanner items={cart.priceDrift} />
                )}

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {count === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <div className="text-4xl mb-3">🍽️</div>
                            <p className="font-medium">Your cart is empty</p>
                            <p className="text-sm text-[#6B5E57] mt-1">
                                Browse the menu to add items
                            </p>
                        </div>
                    ) : (
                        cart?.items.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                        {item.name}
                                    </p>
                                    {item.customizations.map((c) => (
                                        <p
                                            key={c.optionId}
                                            className="text-xs text-[#9E9089]"
                                        >
                                            + {c.label}
                                        </p>
                                    ))}
                                    {item.specialInstructions && (
                                        <p className="text-xs text-stone-400 italic">
                                            "{item.specialInstructions}"
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() =>
                                                    updateItem(
                                                        item.id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                                disabled={isLoading}
                                                className="w-7 h-7 text-sm flex items-center justify-center hover:bg-stone-50 disabled:opacity-50"
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
                                                disabled={isLoading}
                                                className="w-7 h-7 text-sm flex items-center justify-center hover:bg-stone-50 disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="font-semibold text-sm text-[#C8410A]">
                                            {formatPrice(item.itemTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {count > 0 && (
                    <div className="border-t border-stone-100 px-5 py-4 space-y-3">
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-[#6B5E57]">
                                <span>Subtotal</span>
                                <span>{formatPrice(cart?.subtotal ?? 0)}</span>
                            </div>
                            <div className="flex justify-between text-[#6B5E57]">
                                <span>Tax (8%)</span>
                                <span>{formatPrice(cart?.tax ?? 0)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base pt-1 border-t border-stone-100">
                                <span>Total</span>
                                <span>{formatPrice(cart?.total ?? 0)}</span>
                            </div>
                        </div>
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={() => {
                                closeCart();
                                router.push("/cart");
                            }}
                        >
                            Proceed to checkout
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

function PriceDriftBanner({ items }: { items: PriceDriftItem[] }) {
    return (
        <div className="mx-5 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800">
                ⚠️ Prices updated since you added items:
            </p>
            {items.map((d) => (
                <p key={d.menuItemId} className="text-xs text-amber-700 mt-1">
                    {d.name}: {formatPrice(d.cartPrice)} →{" "}
                    {formatPrice(d.currentPrice)}
                </p>
            ))}
        </div>
    );
}
