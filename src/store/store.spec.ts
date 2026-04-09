import { useCartStore, useAuthStore, useOrdersStore } from "./index";
import { OrderStatus, PaymentStatus } from "@/types";

const makeOrder = (id: string, status = OrderStatus.RECEIVED) => ({
    id,
    tableNumber: "1",
    sessionId: "s",
    status,
    subtotal: 10,
    tax: 0.8,
    total: 10.8,
    paymentStatus: PaymentStatus.PAID,
    items: [],
    statusHistory: [],
    placedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

describe("useCartStore", () => {
    beforeEach(() =>
        useCartStore.setState({
            cart: null,
            isCartOpen: false,
            isLoading: false,
            error: null,
        }),
    );
    const cart = {
        sessionId: "s",
        tableNumber: "1",
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
    };

    it("setCart stores cart and clears error", () => {
        useCartStore.getState().setCart(cart);
        expect(useCartStore.getState().cart).toEqual(cart);
        expect(useCartStore.getState().error).toBeNull();
    });
    it("openCart sets isCartOpen true", () => {
        useCartStore.getState().openCart();
        expect(useCartStore.getState().isCartOpen).toBe(true);
    });
    it("closeCart sets isCartOpen false", () => {
        useCartStore.setState({ isCartOpen: true });
        useCartStore.getState().closeCart();
        expect(useCartStore.getState().isCartOpen).toBe(false);
    });
    it("clearCart nullifies cart", () => {
        useCartStore.setState({ cart });
        useCartStore.getState().clearCart();
        expect(useCartStore.getState().cart).toBeNull();
    });
    it("setError stores message", () => {
        useCartStore.getState().setError("oops");
        expect(useCartStore.getState().error).toBe("oops");
    });
});

describe("useAuthStore", () => {
    beforeEach(() =>
        useAuthStore.setState({
            token: null,
            username: null,
            isAuthenticated: false,
        }),
    );
    it("setAuth marks authenticated", () => {
        useAuthStore.getState().setAuth("tok", "admin");
        const s = useAuthStore.getState();
        expect(s.token).toBe("tok");
        expect(s.isAuthenticated).toBe(true);
    });
    it("clearAuth resets all state", () => {
        useAuthStore.setState({
            token: "t",
            username: "u",
            isAuthenticated: true,
        });
        useAuthStore.getState().clearAuth();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
});

describe("useOrdersStore", () => {
    beforeEach(() => useOrdersStore.setState({ orders: [] }));
    it("setOrders replaces list", () => {
        useOrdersStore.getState().setOrders([makeOrder("o1")]);
        expect(useOrdersStore.getState().orders).toHaveLength(1);
    });
    it("upsertOrder adds new order to front", () => {
        useOrdersStore.getState().upsertOrder(makeOrder("o1"));
        useOrdersStore.getState().upsertOrder(makeOrder("o2"));
        expect(useOrdersStore.getState().orders[0].id).toBe("o2");
    });
    it("upsertOrder updates existing order", () => {
        useOrdersStore.setState({
            orders: [makeOrder("o1", OrderStatus.RECEIVED)],
        });
        useOrdersStore
            .getState()
            .upsertOrder(makeOrder("o1", OrderStatus.PREPARING));
        expect(useOrdersStore.getState().orders[0].status).toBe(
            OrderStatus.PREPARING,
        );
        expect(useOrdersStore.getState().orders).toHaveLength(1);
    });
    it("updateOrderStatus mutates status", () => {
        useOrdersStore.setState({
            orders: [makeOrder("o1", OrderStatus.RECEIVED)],
        });
        useOrdersStore
            .getState()
            .updateOrderStatus("o1", OrderStatus.PREPARING);
        expect(useOrdersStore.getState().orders[0].status).toBe(
            OrderStatus.PREPARING,
        );
    });
    it("updateOrderStatus leaves others intact", () => {
        useOrdersStore.setState({ orders: [makeOrder("o1"), makeOrder("o2")] });
        useOrdersStore
            .getState()
            .updateOrderStatus("o1", OrderStatus.PREPARING);
        expect(useOrdersStore.getState().orders[1].status).toBe(
            OrderStatus.RECEIVED,
        );
    });
});
