import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
    it("renders children", () => {
        render(<Button>Click</Button>);
        expect(
            screen.getByRole("button", { name: "Click" }),
        ).toBeInTheDocument();
    });
    it("calls onClick when clicked", () => {
        const fn = jest.fn();
        render(<Button onClick={fn}>Go</Button>);
        fireEvent.click(screen.getByRole("button"));
        expect(fn).toHaveBeenCalledTimes(1);
    });
    it("is disabled when disabled prop set", () => {
        render(<Button disabled>Off</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
    });
    it("is disabled and shows spinner loading", () => {
        render(<Button isLoading>Save</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
        expect(
            screen.getByRole("button").querySelector("svg"),
        ).toBeInTheDocument();
    });
    it("does not fire onClick when disabled", () => {
        const fn = jest.fn();
        render(
            <Button disabled onClick={fn}>
                X
            </Button>,
        );
        fireEvent.click(screen.getByRole("button"));
        expect(fn).not.toHaveBeenCalled();
    });
    it("applies primary colour by default", () => {
        render(<Button>P</Button>);
        expect(screen.getByRole("button").className).toMatch(/C8410A/);
    });
    it("applies secondary style variant", () => {
        render(<Button variant="secondary">S</Button>);
        expect(screen.getByRole("button").className).toMatch(/border/);
    });
});
