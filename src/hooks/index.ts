"use client";
import { useEffect, useCallback, useState } from "react";
import { api } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import {
    joinOrderRoom,
    joinKitchenRoom,
    onOrderStatus,
    onNewOrder,
} from "@/lib/socket";
import { useCartStore, useOrdersStore, useAuthStore } from "@/store";
import { MenuItem, DietaryTag, Order, WsOrderStatusPayload } from "@/types";

export function useCart() {
    const { cart, isLoading, error, setCart, setLoading, setError } =
        useCartStore();
    const fetchCart = useCallback(async () => {
        const sid = getSessionId();
        if (!sid) return;
        setLoading(true);
        try {
            setCart(await api.getCart(sid));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [setCart, setLoading, setError]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addItem = useCallback(
        async (p: {
            menuItemId: string;
            quantity: number;
            customizations?: { optionId: string }[];
            specialInstructions?: string;
        }) => {
            setLoading(true);
            setError(null);
            try {
                const d = await api.addToCart(getSessionId(), p);
                setCart(d);
                return d;
            } catch (e: any) {
                setError(e.message);
                throw e;
            } finally {
                setLoading(false);
            }
        },
        [setCart, setLoading, setError],
    );

    const updateItem = useCallback(
        async (id: string, qty: number) => {
            setLoading(true);
            try {
                setCart(
                    await api.updateCartItem(getSessionId(), id, {
                        quantity: qty,
                    }),
                );
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        },
        [setCart, setLoading, setError],
    );

    const removeItem = useCallback(
        async (id: string) => {
            setLoading(true);
            try {
                setCart(await api.removeFromCart(getSessionId(), id));
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        },
        [setCart, setLoading, setError],
    );

    return {
        cart,
        isLoading,
        error,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
    };
}

export function useMenu(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    dietary?: DietaryTag[];
}) {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.getItems(filters)
            .then((d) => {
                if (!cancelled) setItems(d);
            })
            .catch((e) => {
                if (!cancelled) setError(e.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters?.category,
        filters?.search,
        filters?.minPrice,
        filters?.maxPrice,
        filters?.dietary?.join(","),
    ]);
    return { items, isLoading, error };
}

export function useOrderTracker(orderId: string) {
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!orderId) return;
        api.getOrder(orderId)
            .then(setOrder)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
        joinOrderRoom(orderId);
        const off = onOrderStatus((p: WsOrderStatusPayload) => {
            if (p.orderId === orderId) {
                setOrder((prev) =>
                    prev
                        ? {
                              ...prev,
                              status: p.status,
                              statusHistory: [
                                  ...prev.statusHistory,
                                  {
                                      id: Date.now().toString(),
                                      status: p.status,
                                      changedAt: p.timestamp,
                                  },
                              ],
                          }
                        : prev,
                );
            }
        });
        return off;
    }, [orderId]);
    return { order, isLoading, error };
}

export function useKitchenOrders() {
    const { orders, setOrders, upsertOrder, updateOrderStatus } =
        useOrdersStore();
    const { token } = useAuthStore();
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.getAllOrders()
            .then(setOrders)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [setOrders]);
    useEffect(() => {
        if (!token) return;
        joinKitchenRoom(token);
        const offNew = onNewOrder(({ order }) => upsertOrder(order));
        const offStatus = onOrderStatus((p) =>
            updateOrderStatus(p.orderId, p.status),
        );
        return () => {
            offNew();
            offStatus();
        };
    }, [token, upsertOrder, updateOrderStatus]);

    const advanceStatus = useCallback(
        async (orderId: string, status: string) => {
            try {
                upsertOrder(
                    await api.updateOrderStatus(orderId, status as any),
                );
            } catch (e: any) {
                setError(e.message);
                throw e;
            }
        },
        [upsertOrder],
    );

    return { orders, isLoading, error, advanceStatus };
}
