import { clsx } from "clsx";
const V: Record<string, string> = {
    vegetarian: "bg-green-50 text-green-700 border border-green-200",
    vegan: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "gluten-free": "bg-amber-50 text-amber-700 border border-amber-200",
    default: "bg-stone-100 text-stone-600 border border-stone-200",
};
export function Badge({
    label,
    variant = "default",
}: {
    label: string;
    variant?: string;
}) {
    return (
        <span
            className={clsx(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                V[variant] ?? V.default,
            )}
        >
            {label}
        </span>
    );
}
export function DietaryBadges({ tags }: { tags: string[] }) {
    return (
        <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
                <Badge key={t} label={t} variant={t} />
            ))}
        </div>
    );
}
