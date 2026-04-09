import { v4 as uuid } from "uuid";
const SESSION_KEY = "ember_session_id";

export function getSessionId(): string {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
        id = uuid();
        localStorage.setItem(SESSION_KEY, id);
    }
    return id;
}
export function formatPrice(n: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(n);
}
export function formatTime(iso: string): string {
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(iso));
}
export function timeAgo(iso: string): string {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins === 1) return "1 min ago";
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
}
