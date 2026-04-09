import React from "react";
import { render, screen } from "@testing-library/react";
import { Skeleton, MenuItemSkeleton, OrderCardSkeleton } from "./Skeleton";

describe("Skeleton", () => {
    it("renders with role status", () => {
        render(<Skeleton />);
        expect(screen.getByRole("status")).toBeInTheDocument();
    });
    it("applies extra className", () => {
        render(<Skeleton className="w-32 h-4" />);
        expect(screen.getByRole("status").className).toMatch(/w-32/);
    });
});
describe("MenuItemSkeleton", () => {
    it("renders", () => {
        const { container } = render(<MenuItemSkeleton />);
        expect(container.firstChild).toBeInTheDocument();
    });
});
describe("OrderCardSkeleton", () => {
    it("renders", () => {
        const { container } = render(<OrderCardSkeleton />);
        expect(container.firstChild).toBeInTheDocument();
    });
});
