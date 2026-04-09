import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge, DietaryBadges } from "./Badge";

describe("Badge", () => {
    it("renders label", () => {
        render(<Badge label="vegetarian" variant="vegetarian" />);
        expect(screen.getByText("vegetarian")).toBeInTheDocument();
    });
    it("applies vegetarian green style", () => {
        render(<Badge label="v" variant="vegetarian" />);
        expect(screen.getByText("v").className).toMatch(/green/);
    });
    it("applies vegan emerald style", () => {
        render(<Badge label="v" variant="vegan" />);
        expect(screen.getByText("v").className).toMatch(/emerald/);
    });
    it("applies gluten-free amber style", () => {
        render(<Badge label="g" variant="gluten-free" />);
        expect(screen.getByText("g").className).toMatch(/amber/);
    });
});

describe("DietaryBadges", () => {
    it("renders badge per tag", () => {
        render(<DietaryBadges tags={["vegetarian", "gluten-free"]} />);
        expect(screen.getByText("vegetarian")).toBeInTheDocument();
        expect(screen.getByText("gluten-free")).toBeInTheDocument();
    });
    it("renders nothing for []", () => {
        const { container } = render(<DietaryBadges tags={[]} />);
        expect(container.querySelectorAll("span")).toHaveLength(0);
    });
});
