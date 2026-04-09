"use client";
import { useState, useEffect } from "react";
import { Category, DietaryTag } from "@/types";
import { api } from "@/lib/api";
import { clsx } from "clsx";

interface Filters {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    dietary?: DietaryTag[];
}
const DIETARY = [
    { label: "🌿 Vegetarian", value: "vegetarian" as DietaryTag },
    { label: "🌱 Vegan", value: "vegan" as DietaryTag },
    { label: "🌾 Gluten-free", value: "gluten-free" as DietaryTag },
];

export function FilterBar({
    filters,
    onChange,
}: {
    filters: Filters;
    onChange: (f: Filters) => void;
}) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState(filters.search ?? "");

    useEffect(() => {
        api.getCategories()
            .then(setCategories)
            .catch(() => {});
    }, []);
    useEffect(() => {
        const t = setTimeout(
            () => onChange({ ...filters, search: search || undefined }),
            350,
        );
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const toggleDietary = (tag: DietaryTag) => {
        const curr = filters.dietary ?? [];
        const next = curr.includes(tag)
            ? curr.filter((t) => t !== tag)
            : [...curr, tag];
        onChange({ ...filters, dietary: next.length ? next : undefined });
    };

    return (
        <div className="bg-white border-b border-stone-100 sticky top-[64px] z-30">
            <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
                <div className="relative">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search dishes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8410A]/30 focus:border-[#C8410A]"
                    />
                    {search && (
                        <button
                            onClick={() => {
                                setSearch("");
                                onChange({ ...filters, search: undefined });
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {[{ name: "All", slug: "" }, ...categories].map((c) => (
                        <button
                            key={c.slug}
                            onClick={() =>
                                onChange({
                                    ...filters,
                                    category: c.slug || undefined,
                                })
                            }
                            className={clsx(
                                "flex-shrink-0 px-4 py-1.5 text-sm font-medium rounded-full border transition-all",
                                (!filters.category && !c.slug) ||
                                    filters.category === c.slug
                                    ? "bg-[#C8410A] text-white border-[#C8410A]"
                                    : "bg-white text-[#6B5E57] border-stone-200 hover:border-[#C8410A]/40",
                            )}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {DIETARY.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => toggleDietary(value)}
                            className={clsx(
                                "px-3 py-1 text-xs font-medium rounded-full border transition-all",
                                (filters.dietary ?? []).includes(value)
                                    ? "bg-[#C8410A] text-white border-[#C8410A]"
                                    : "bg-white text-[#6B5E57] border-stone-200 hover:border-[#C8410A]/50",
                            )}
                        >
                            {label}
                        </button>
                    ))}
                    <div className="flex items-center gap-2 ml-auto">
                        <label className="text-xs text-stone-500">Price</label>
                        <select
                            value={filters.maxPrice ?? ""}
                            onChange={(e) =>
                                onChange({
                                    ...filters,
                                    maxPrice: e.target.value
                                        ? Number(e.target.value)
                                        : undefined,
                                })
                            }
                            className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                        >
                            <option value="">Any price</option>
                            <option value="15">Under $15</option>
                            <option value="30">Under $30</option>
                            <option value="50">Under $50</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
