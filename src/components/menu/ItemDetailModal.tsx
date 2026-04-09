"use client";
import { useState } from "react";
import Image from "next/image";
import { CustomizationGroup } from "@/types";
import { formatPrice } from "@/lib/session";
import { useUiStore, useCartStore } from "@/store";
import { useCart } from "@/hooks";
import { Button } from "@/components/ui/Button";
import { DietaryBadges } from "@/components/ui/Badge";

export function ItemDetailModal() {
    const { selectedItem, isItemModalOpen, closeItemModal } = useUiStore();
    const openCart = useCartStore((s) => s.openCart);
    const { addItem } = useCart();
    const [qty, setQty] = useState(1);
    const [opts, setOpts] = useState<Record<string, string[]>>({});
    const [notes, setNotes] = useState("");
    const [adding, setAdding] = useState(false);
    const [err, setErr] = useState("");

    if (!isItemModalOpen || !selectedItem) return null;

    const customTotal = Object.values(opts)
        .flat()
        .reduce((sum, id) => {
            for (const g of selectedItem.customizationGroups ?? []) {
                const o = g.options.find((o) => o.id === id);
                if (o) return sum + o.priceDelta;
            }
            return sum;
        }, 0);
    const total = (selectedItem.basePrice + customTotal) * qty;

    function toggle(g: CustomizationGroup, id: string) {
        setOpts((p) => {
            const cur = p[g.id] ?? [];
            if (g.maxSelections === 1) return { ...p, [g.id]: [id] };
            if (cur.includes(id))
                return { ...p, [g.id]: cur.filter((x) => x !== id) };
            if (cur.length >= g.maxSelections) return p;
            return { ...p, [g.id]: [...cur, id] };
        });
    }

    function validate() {
        for (const g of selectedItem?.customizationGroups ?? []) {
            if (g.required && !opts[g.id]?.length) {
                setErr(`Please select a ${g.name}`);
                return false;
            }
        }
        return true;
    }

    async function handleAdd() {
        if (!validate()) return;
        setAdding(true);
        setErr("");
        try {
            await addItem({
                menuItemId: selectedItem!.id,
                quantity: qty,
                customizations: Object.values(opts)
                    .flat()
                    .map((id) => ({ optionId: id })),
                specialInstructions: notes || undefined,
            });
            closeItemModal();
            openCart();
            setQty(1);
            setOpts({});
            setNotes("");
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setAdding(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) closeItemModal();
            }}
        >
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeItemModal}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="relative h-52 bg-stone-100">
                    <Image
                        src={selectedItem.imageUrl}
                        alt={selectedItem.name}
                        fill
                        className="object-cover rounded-t-2xl"
                    />
                    <button
                        onClick={closeItemModal}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <h2 className="font-bold text-xl">
                            {selectedItem.name}
                        </h2>
                        <p className="text-[#6B5E57] text-sm mt-1">
                            {selectedItem.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="font-bold text-[#C8410A] text-lg">
                                {formatPrice(selectedItem.basePrice)}
                            </span>
                            <span className="text-xs text-stone-400">
                                ⏱ {selectedItem.prepTimeMins} min
                            </span>
                        </div>
                        {selectedItem.dietaryTags.length > 0 && (
                            <div className="mt-2">
                                <DietaryBadges
                                    tags={selectedItem.dietaryTags}
                                />
                            </div>
                        )}
                    </div>
                    {(selectedItem.customizationGroups ?? []).map((g) => (
                        <div key={g.id}>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-sm">
                                    {g.name}
                                </h3>
                                {g.required && (
                                    <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">
                                        Required
                                    </span>
                                )}
                                {g.maxSelections > 1 && (
                                    <span className="text-xs text-stone-400">
                                        (up to {g.maxSelections})
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                {g.options.map((o) => {
                                    const sel = (opts[g.id] ?? []).includes(
                                        o.id,
                                    );
                                    return (
                                        <button
                                            key={o.id}
                                            onClick={() => toggle(g, o.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${sel ? "border-[#C8410A] bg-orange-50 text-[#C8410A]" : "border-stone-200 hover:border-[#C8410A]/40"}`}
                                        >
                                            <span>{o.label}</span>
                                            <span className="font-medium">
                                                {o.priceDelta > 0
                                                    ? `+${formatPrice(o.priceDelta)}`
                                                    : "Included"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    <div>
                        <label className="text-sm font-medium block mb-1.5">
                            Special instructions{" "}
                            <span className="text-stone-400 font-normal">
                                (optional)
                            </span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Allergies, preferences..."
                            maxLength={300}
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#C8410A]/30"
                        />
                    </div>
                    {err && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                            {err}
                        </p>
                    )}
                    <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() =>
                                    setQty((q) => Math.max(1, q - 1))
                                }
                                className="w-10 h-10 flex items-center justify-center text-lg hover:bg-stone-50"
                            >
                                −
                            </button>
                            <span className="w-10 text-center font-semibold text-sm">
                                {qty}
                            </span>
                            <button
                                onClick={() =>
                                    setQty((q) =>
                                        Math.min(
                                            selectedItem.stockQuantity,
                                            q + 1,
                                        ),
                                    )
                                }
                                className="w-10 h-10 flex items-center justify-center text-lg hover:bg-stone-50"
                            >
                                +
                            </button>
                        </div>
                        <Button
                            onClick={handleAdd}
                            isLoading={adding}
                            className="flex-1"
                        >
                            Add {qty > 1 ? `${qty} × ` : ""}
                            {formatPrice(total)}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
