import React from "react";
import { render, screen } from "@testing-library/react";
import { StatusStepper } from "./StatusStepper";
import { OrderStatus } from "@/types";

describe("StatusStepper", () => {
    it("renders all four step labels", () => {
        render(<StatusStepper status={OrderStatus.RECEIVED} />);
        ["Order received", "Preparing", "Ready", "Completed"].forEach((l) =>
            expect(screen.getByText(l)).toBeInTheDocument(),
        );
    });
    it("shows RECEIVED description", () => {
        render(<StatusStepper status={OrderStatus.RECEIVED} />);
        expect(screen.getByText("We have your order")).toBeInTheDocument();
    });
    it("shows PREPARING description", () => {
        render(<StatusStepper status={OrderStatus.PREPARING} />);
        expect(
            screen.getByText("Kitchen is working on it"),
        ).toBeInTheDocument();
    });
    it("shows READY description", () => {
        render(<StatusStepper status={OrderStatus.READY} />);
        expect(screen.getByText("Your order is ready")).toBeInTheDocument();
    });
    it("shows COMPLETED description", () => {
        render(<StatusStepper status={OrderStatus.COMPLETED} />);
        expect(screen.getByText("Enjoy your meal!")).toBeInTheDocument();
    });
    it("renders checkmarks for past steps", () => {
        render(<StatusStepper status={OrderStatus.PREPARING} />);
        expect(screen.getAllByText("✓").length).toBeGreaterThanOrEqual(1);
    });
    it("progress bar reflects READY index", () => {
        const { container } = render(
            <StatusStepper status={OrderStatus.READY} />,
        );
        const bar = container.querySelector('[style*="width"]');
        expect(bar?.getAttribute("style")).toMatch(/66\.6/);
    });
});
