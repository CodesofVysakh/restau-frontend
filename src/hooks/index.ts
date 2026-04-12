"use client";
import { useEffect, useCallback, useState, useRef } from "react";
import { api } from "@/lib/api";
import {
    getSessionId,
    persistOrderId,
    getPersistedOrderIds,
} from "@/lib/session";
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

// ── useSessionOrders ──────────────────────────────────────────────────────────
// Fetches ALL orders for this session — both from the API (by sessionId) and
// from localStorage-persisted order IDs (handles session resets).
// Joins a WebSocket room for each active order so status updates are live.

export function useSessionOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Track which order rooms we've already joined to avoid duplicates
    const joinedRooms = useRef<Set<string>>(new Set());

    const updateOrderStatus = useCallback((orderId: string, status: string) => {
        setOrders((prev) =>
            prev.map((o) =>
                o.id === orderId
                    ? {
                          ...o,
                          status: status as any,
                          statusHistory: [
                              ...o.statusHistory,
                              {
                                  id: Date.now().toString(),
                                  status: status as any,
                                  changedAt: new Date().toISOString(),
                              },
                          ],
                      }
                    : o,
            ),
        );
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const sessionId = getSessionId();

                // Fetch orders by session from API
                const sessionOrders = await api.getOrdersBySession(sessionId);

                // Also fetch any persisted order IDs that might belong to a previous session
                const persistedIds = getPersistedOrderIds();
                const sessionIds = new Set(sessionOrders.map((o) => o.id));
                const orphanIds = persistedIds.filter(
                    (id) => !sessionIds.has(id),
                );

                // Fetch orphaned orders individually
                const orphanOrders = await Promise.allSettled(
                    orphanIds.map((id) => api.getOrder(id)),
                ).then((results) =>
                    results
                        .filter(
                            (r): r is PromiseFulfilledResult<Order> =>
                                r.status === "fulfilled",
                        )
                        .map((r) => r.value),
                );

                if (cancelled) return;

                // Merge, deduplicate, sort newest first
                const all = [...sessionOrders, ...orphanOrders];
                const deduped = Array.from(
                    new Map(all.map((o) => [o.id, o])).values(),
                ).sort(
                    (a, b) =>
                        new Date(b.placedAt).getTime() -
                        new Date(a.placedAt).getTime(),
                );

                setOrders(deduped);

                // Persist all IDs we found
                deduped.forEach((o) => persistOrderId(o.id));
            } catch (e: any) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    // Join WebSocket rooms for all active orders and subscribe to status updates
    useEffect(() => {
        const activeOrders = orders.filter((o) => o.status !== "COMPLETED");

        activeOrders.forEach((o) => {
            if (!joinedRooms.current.has(o.id)) {
                joinOrderRoom(o.id);
                joinedRooms.current.add(o.id);
            }
        });

        const off = onOrderStatus((payload: WsOrderStatusPayload) => {
            updateOrderStatus(payload.orderId, payload.status);
        });

        return off;
    }, [orders, updateOrderStatus]);

    // Group orders by table number
    const ordersByTable = orders.reduce<Record<string, Order[]>>(
        (acc, order) => {
            const table = order.tableNumber || "Unknown";
            if (!acc[table]) acc[table] = [];
            acc[table].push(order);
            return acc;
        },
        {},
    );

    const activeCount = orders.filter((o) => o.status !== "COMPLETED").length;

    return { orders, ordersByTable, isLoading, error, activeCount };
}
