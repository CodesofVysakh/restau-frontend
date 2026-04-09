import { io, Socket } from "socket.io-client";
import { WsOrderStatusPayload, Order } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";
let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket)
        socket = io(WS_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
        });
    return socket;
}
export function joinOrderRoom(orderId: string) {
    getSocket().emit("join:order", { orderId });
}
export function joinKitchenRoom(token: string) {
    getSocket().emit("join:kitchen", { token });
}
export function onOrderStatus(
    fn: (p: WsOrderStatusPayload) => void,
): () => void {
    const s = getSocket();
    s.on("order:status", fn);
    return () => s.off("order:status", fn);
}
export function onNewOrder(fn: (p: { order: Order }) => void): () => void {
    const s = getSocket();
    s.on("order:new", fn);
    return () => s.off("order:new", fn);
}
export function disconnectSocket() {
    socket?.disconnect();
    socket = null;
}
