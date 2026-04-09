"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMenu } from "@/hooks";
import { useCartStore, useUiStore } from "@/store";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { FilterBar } from "@/components/menu/FilterBar";
import { ItemDetailModal } from "@/components/menu/ItemDetailModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MenuItemSkeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/lib/session";
import { DietaryTag } from "@/types";

interface Filters {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    dietary?: DietaryTag[];
}

export default function MenuPage() {
    const router = useRouter();
    const [filters, setFilters] = useState<Filters>({});
    const { items, isLoading, error } = useMenu(filters);
    const { cart, openCart } = useCartStore();
    const {
        tableNumber,
        isTableModalOpen,
        openTableModal,
        closeTableModal,
        setTableNumber,
    } = useUiStore();
    const [tableInput, setTableInput] = useState(tableNumber);
    const count = cart?.itemCount ?? 0;

    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            <header className="bg-[#1A1410] sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div>
                        <h1
                            style={{ fontFamily: "'Playfair Display',serif" }}
                            className="text-[#F0C050] text-xl font-bold tracking-widest"
                        >
                            EMBER
                        </h1>
                        {tableNumber ? (
                            <button
                                onClick={openTableModal}
                                className="text-xs text-stone-400 hover:text-stone-200"
                            >
                                Table {tableNumber} ✏️
                            </button>
                        ) : (
                            <button
                                onClick={openTableModal}
                                className="text-xs text-[#C8410A] hover:text-[#F4622A] animate-pulse"
                            >
                                Set table number →
                            </button>
                        )}
                    </div>
                    <button
                        onClick={openCart}
                        className="flex items-center gap-2 bg-[#C8410A] hover:bg-[#A33508] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <span>🛒</span>
                        {count > 0 ? (
                            <>
                                <span className="bg-white text-[#C8410A] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                    {count}
                                </span>
                                <span className="font-semibold">
                                    {formatPrice(cart?.total ?? 0)}
                                </span>
                            </>
                        ) : (
                            <span>Cart</span>
                        )}
                    </button>
                </div>
            </header>

            <div className="bg-gradient-to-b from-[#1A1410] to-[#2D2420] py-10 px-4 text-center">
                <p className="text-[#C9972A] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
                    Fine dining
                </p>
                <h2
                    style={{ fontFamily: "'Playfair Display',serif" }}
                    className="text-white text-3xl font-bold mb-2"
                >
                    Tonight&apos;s Menu
                </h2>
                <p className="text-stone-400 text-sm max-w-sm mx-auto">
                    Seasonal ingredients, handcrafted dishes, exceptional
                    experience.
                </p>
            </div>

            <FilterBar filters={filters} onChange={setFilters} />

            <main className="max-w-6xl mx-auto px-4 py-8">
                {error && (
                    <div className="text-center py-12 text-red-600 bg-red-50 rounded-xl p-6">
                        <p className="font-medium">Could not load menu</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <MenuItemSkeleton key={i} />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="font-semibold text-lg">
                            No items found
                        </h3>
                        <p className="text-[#6B5E57] text-sm mt-1">
                            Try adjusting your filters
                        </p>
                        <button
                            onClick={() => setFilters({})}
                            className="mt-4 text-sm text-[#C8410A] hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {items.map((item) => (
                            <MenuItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </main>

            <ItemDetailModal />
            <CartDrawer />

            {isTableModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={closeTableModal}
                    />
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl">
                        <h3 className="font-bold text-lg mb-1">
                            Your table number
                        </h3>
                        <p className="text-sm text-[#6B5E57] mb-4">
                            Enter the number shown on your table.
                        </p>
                        <input
                            type="text"
                            value={tableInput}
                            onChange={(e) => setTableInput(e.target.value)}
                            placeholder="e.g. 5 or A3"
                            maxLength={10}
                            className="w-full px-4 py-2.5 border border-stone-200 rounded-lg text-lg text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#C8410A]/30"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && tableInput.trim()) {
                                    setTableNumber(tableInput.trim());
                                    closeTableModal();
                                }
                            }}
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                if (tableInput.trim()) {
                                    setTableNumber(tableInput.trim());
                                    closeTableModal();
                                }
                            }}
                            disabled={!tableInput.trim()}
                            className="mt-3 w-full bg-[#C8410A] text-white py-2.5 rounded-lg font-medium hover:bg-[#A33508] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
