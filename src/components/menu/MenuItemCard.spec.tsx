import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MenuItemCard } from "./MenuItemCard";
import { MenuItem } from "@/types";

const mockOpen = jest.fn();
jest.mock("@/store", () => ({
    useUiStore: (sel: any) => sel({ openItemModal: mockOpen }),
}));

const item: MenuItem = {
    id: "i1",
    categoryId: "c1",
    name: "Burrata",
    description: "Creamy.",
    imageUrl: "https://example.com/img.jpg",
    basePrice: 16,
    prepTimeMins: 8,
    stockQuantity: 20,
    isAvailable: true,
    dietaryTags: ["vegetarian"],
    updatedAt: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
};

describe("MenuItemCard", () => {
    beforeEach(() => jest.clearAllMocks());
    it("renders name and description", () => {
        render(<MenuItemCard item={item} />);
        expect(screen.getByText("Burrata")).toBeInTheDocument();
        expect(screen.getByText(/Creamy/)).toBeInTheDocument();
    });
    it("renders formatted price", () => {
        render(<MenuItemCard item={item} />);
        expect(screen.getByText("$16.00")).toBeInTheDocument();
    });
    it("renders prep time", () => {
        render(<MenuItemCard item={item} />);
        expect(screen.getByText(/8 min/)).toBeInTheDocument();
    });
    it("renders dietary badge", () => {
        render(<MenuItemCard item={item} />);
        expect(screen.getByText("vegetarian")).toBeInTheDocument();
    });
    it("opens modal on add to cart click", () => {
        render(<MenuItemCard item={item} />);
        fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
        expect(mockOpen).toHaveBeenCalledWith(item);
    });
    it("shows sold out and disables button", () => {
        render(<MenuItemCard item={{ ...item, isAvailable: false }} />);
        expect(screen.getByText("Sold out")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /unavailable/i }),
        ).toBeDisabled();
    });
    it("shows low stock badge at <= 3", () => {
        render(<MenuItemCard item={{ ...item, stockQuantity: 2 }} />);
        expect(screen.getByText("2 left")).toBeInTheDocument();
    });
    it("no low stock badge above 3", () => {
        render(<MenuItemCard item={{ ...item, stockQuantity: 10 }} />);
        expect(screen.queryByText(/left/)).not.toBeInTheDocument();
    });
});
