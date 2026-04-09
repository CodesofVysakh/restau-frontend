import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Cart, Order, MenuItem } from "@/types";

interface CartStore {
    cart: Cart | null;
    isCartOpen: boolean;
    isLoading: boolean;
    error: string | null;
    setCart: (c: Cart) => void;
    openCart: () => void;
    closeCart: () => void;
    setLoading: (v: boolean) => void;
    setError: (e: string | null) => void;
    clearCart: () => void;
}
export const useCartStore = create<CartStore>()((set) => ({
    cart: null,
    isCartOpen: false,
    isLoading: false,
    error: null,
    setCart: (cart) => set({ cart, error: null }),
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearCart: () => set({ cart: null }),
}));

interface AuthStore {
    token: string | null;
    username: string | null;
    isAuthenticated: boolean;
    setAuth: (t: string, u: string) => void;
    clearAuth: () => void;
}
export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            token: null,
            username: null,
            isAuthenticated: false,
            setAuth: (token, username) =>
                set({ token, username, isAuthenticated: true }),
            clearAuth: () =>
                set({ token: null, username: null, isAuthenticated: false }),
        }),
        { name: "ember_admin_auth" },
    ),
);

interface OrdersStore {
    orders: Order[];
    setOrders: (o: Order[]) => void;
    upsertOrder: (o: Order) => void;
    updateOrderStatus: (id: string, s: string) => void;
}
export const useOrdersStore = create<OrdersStore>()((set) => ({
    orders: [],
    setOrders: (orders) => set({ orders }),
    upsertOrder: (order) =>
        set((s) => {
            const i = s.orders.findIndex((o) => o.id === order.id);
            if (i >= 0) {
                const a = [...s.orders];
                a[i] = order;
                return { orders: a };
            }
            return { orders: [order, ...s.orders] };
        }),
    updateOrderStatus: (id, status) =>
        set((s) => ({
            orders: s.orders.map((o) =>
                o.id === id ? { ...o, status: status as any } : o,
            ),
        })),
}));

interface UiStore {
    selectedItem: MenuItem | null;
    isItemModalOpen: boolean;
    openItemModal: (i: MenuItem) => void;
    closeItemModal: () => void;
    tableNumber: string;
    setTableNumber: (t: string) => void;
    isTableModalOpen: boolean;
    openTableModal: () => void;
    closeTableModal: () => void;
}
export const useUiStore = create<UiStore>()(
    persist(
        (set) => ({
            selectedItem: null,
            isItemModalOpen: false,
            openItemModal: (item) =>
                set({ selectedItem: item, isItemModalOpen: true }),
            closeItemModal: () => set({ isItemModalOpen: false }),
            tableNumber: "",
            setTableNumber: (tableNumber) => set({ tableNumber }),
            isTableModalOpen: false,
            openTableModal: () => set({ isTableModalOpen: true }),
            closeTableModal: () => set({ isTableModalOpen: false }),
        }),
        {
            name: "ember_ui",
            partialize: (s) => ({ tableNumber: s.tableNumber }),
        },
    ),
);
