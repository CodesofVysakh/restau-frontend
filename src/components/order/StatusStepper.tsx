import { OrderStatus } from "@/types";
import { clsx } from "clsx";

const STEPS = [
    {
        status: OrderStatus.RECEIVED,
        label: "Order received",
        icon: "✓",
        desc: "We have your order",
    },
    {
        status: OrderStatus.PREPARING,
        label: "Preparing",
        icon: "👨‍🍳",
        desc: "Kitchen is working on it",
    },
    {
        status: OrderStatus.READY,
        label: "Ready",
        icon: "🔔",
        desc: "Your order is ready",
    },
    {
        status: OrderStatus.COMPLETED,
        label: "Completed",
        icon: "🎉",
        desc: "Enjoy your meal!",
    },
];
const ORDER = [
    OrderStatus.RECEIVED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.COMPLETED,
];

export function StatusStepper({ status }: { status: OrderStatus }) {
    const cur = ORDER.indexOf(status);
    return (
        <div className="py-6">
            <div className="flex items-start justify-between relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-stone-200">
                    <div
                        className="h-full bg-[#C8410A] transition-all duration-700"
                        style={{
                            width: `${(cur / (STEPS.length - 1)) * 100}%`,
                        }}
                    />
                </div>
                {STEPS.map((step, i) => {
                    const done = i < cur,
                        active = i === cur,
                        pending = i > cur;
                    return (
                        <div
                            key={step.status}
                            className="flex flex-col items-center gap-2 flex-1 relative z-10"
                        >
                            <div
                                className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                                    done && "bg-[#C8410A] text-white",
                                    active &&
                                        "bg-[#C8410A] text-white ring-4 ring-[#C8410A]/20 scale-110",
                                    pending &&
                                        "bg-white border-2 border-stone-300 text-stone-400",
                                )}
                            >
                                {done ? "✓" : step.icon}
                            </div>
                            <div className="text-center">
                                <p
                                    className={clsx(
                                        "text-xs font-semibold",
                                        done || active
                                            ? "text-[#C8410A]"
                                            : "text-stone-400",
                                    )}
                                >
                                    {step.label}
                                </p>
                                {active && (
                                    <p className="text-xs text-[#6B5E57] mt-0.5 max-w-[80px]">
                                        {step.desc}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
