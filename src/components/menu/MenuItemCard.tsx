"use client";
import Image from "next/image";
import { MenuItem } from "@/types";
import { formatPrice } from "@/lib/session";
import { DietaryBadges } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store";

export function MenuItemCard({ item }: { item: MenuItem }) {
    const openItemModal = useUiStore((s) => s.openItemModal);
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
            <div className="relative h-48 bg-stone-100 overflow-hidden">
                <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width:768px) 100vw,33vw"
                    className="object-cover hover:scale-105 transition-transform duration-300"
                />
                {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">
                            Sold out
                        </span>
                    </div>
                )}
                {item.stockQuantity <= 3 && item.stockQuantity > 0 && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.stockQuantity} left
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-1 gap-2">
                <div>
                    <h3 className="font-semibold text-[15px] leading-snug">
                        {item.name}
                    </h3>
                    <p className="text-[#6B5E57] text-sm mt-1 line-clamp-2">
                        {item.description}
                    </p>
                </div>
                {item.dietaryTags.length > 0 && (
                    <DietaryBadges tags={item.dietaryTags} />
                )}
                <p className="text-xs text-[#9E9089]">
                    ⏱ {item.prepTimeMins} min
                </p>
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="font-bold text-[#C8410A] text-lg">
                        {formatPrice(item.basePrice)}
                    </span>
                    <Button
                        size="sm"
                        onClick={() => openItemModal(item)}
                        disabled={!item.isAvailable}
                    >
                        {item.isAvailable ? "Add to cart" : "Unavailable"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
