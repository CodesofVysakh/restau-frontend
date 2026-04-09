import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { KitchenOrderCard } from "./KitchenOrderCard";
import { Order, OrderStatus, PaymentStatus } from "@/types";

const makeOrder = (status: OrderStatus): Order => ({
    id: "order-abc12345",
    tableNumber: "7",
    sessionId: "s1",
    status,
    subtotal: 32,
    tax: 2.56,
    total: 34.56,
    paymentStatus: PaymentStatus.PAID,
    paymentId: "p1",
    items: [
        {
            id: "oi1",
            menuItemId: "i1",
            name: "Calamari",
            imageUrl: "",
            quantity: 2,
            unitPrice: 14.5,
            specialInstructions: "Extra lemon",
            customizations: [],
            itemTotal: 29,
        },
    ],
    statusHistory: [{ id: "h1", status, changedAt: new Date().toISOString() }],
    placedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

describe("KitchenOrderCard", () => {
    const onAdvance = jest.fn();
    beforeEach(() => jest.clearAllMocks());

    it("renders table number", () => {
        render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.RECEIVED)}
                onAdvance={onAdvance}
            />,
        );
        expect(screen.getByText("Table 7")).toBeInTheDocument();
    });
    it("renders order ID prefix", () => {
        render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.RECEIVED)}
                onAdvance={onAdvance}
            />,
        );
        expect(screen.getByText(/ORDER-ABC/i)).toBeInTheDocument();
    });
    it("renders item name and quantity", () => {
        render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.RECEIVED)}
                onAdvance={onAdvance}
            />,
        );
        expect(screen.getByText("Calamari")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });
    it("renders special instructions", () => {
        render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.RECEIVED)}
                onAdvance={onAdvance}
            />,
        );
        expect(screen.getByText(/Extra lemon/)).toBeInTheDocument();
    });
    it("renders total price", () => {
        render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.RECEIVED)}
                onAdvance={onAdvance}
            />,
        );
        expect(screen.getByText("$34.56")).toBeInTheDocument();
    });
    it('shows "Start preparing" for RECEIVED', () => {
        render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.RECEIVED)}
                onAdvance={onAdvance}
            />,
        );
        expect(
            screen.getByRole("button", { name: /start preparing/i }),
        ).toBeInTheDocument();
    });
    it('shows "Mark as ready" for PREPARING', () => {
        render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.PREPARING)}
                onAdvance={onAdvance}
            />,
        );
        expect(
            screen.getByRole("button", { name: /mark as ready/i }),
        ).toBeInTheDocument();
    });
    it('shows "Mark completed" for READY', () => {
        render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.READY)}
                onAdvance={onAdvance}
            />,
        );
        expect(
            screen.getByRole("button", { name: /mark completed/i }),
        ).toBeInTheDocument();
    });
    it("shows no button for COMPLETED", () => {
        render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.COMPLETED)}
                onAdvance={onAdvance}
            />,
        );
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("calls onAdvance with correct next status", async () => {
        onAdvance.mockResolvedValue(undefined);
        render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.RECEIVED)}
                onAdvance={onAdvance}
            />,
        );
        fireEvent.click(
            screen.getByRole("button", { name: /start preparing/i }),
        );
        await waitFor(() =>
            expect(onAdvance).toHaveBeenCalledWith(
                "order-abc12345",
                OrderStatus.PREPARING,
            ),
        );
    });

    it("shows error on onAdvance rejection", async () => {
        onAdvance.mockRejectedValue(new Error("Network error"));
        render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.RECEIVED)}
                onAdvance={onAdvance}
            />,
        );
        fireEvent.click(
            screen.getByRole("button", { name: /start preparing/i }),
        );
        await waitFor(() =>
            expect(screen.getByText("Network error")).toBeInTheDocument(),
        );
    });

    it("applies blue ring for RECEIVED orders", () => {
        const { container } = render(
            <KitchenOrderCard
                order={makeOrder(OrderStatus.RECEIVED)}
                onAdvance={onAdvance}
            />,
        );
        expect((container.firstChild as HTMLElement).className).toMatch(
            /ring-2/,
        );
    });
});
