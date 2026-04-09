import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "./FilterBar";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({ api: { getCategories: jest.fn() } }));
const cats = [
    { id: "c1", name: "Appetizers", slug: "appetizers", displayOrder: 1 },
    { id: "c2", name: "Mains", slug: "main-course", displayOrder: 2 },
];

describe("FilterBar", () => {
    const onChange = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        (api.getCategories as jest.Mock).mockResolvedValue(cats);
    });

    it("renders search input", () => {
        render(<FilterBar filters={{}} onChange={onChange} />);
        expect(
            screen.getByPlaceholderText("Search dishes..."),
        ).toBeInTheDocument();
    });
    it("loads category chips", async () => {
        render(<FilterBar filters={{}} onChange={onChange} />);
        await waitFor(() =>
            expect(screen.getByText("Appetizers")).toBeInTheDocument(),
        );
    });
    it("always shows All chip", () => {
        render(<FilterBar filters={{}} onChange={onChange} />);
        expect(screen.getByText("All")).toBeInTheDocument();
    });

    it("calls onChange with category on chip click", async () => {
        render(<FilterBar filters={{}} onChange={onChange} />);
        await waitFor(() => screen.getByText("Appetizers"));
        fireEvent.click(screen.getByText("Appetizers"));
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ category: "appetizers" }),
        );
    });

    it("toggles dietary filter on and off", async () => {
        render(<FilterBar filters={{}} onChange={onChange} />);
        fireEvent.click(screen.getByText(/Vegan/));
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ dietary: ["vegan"] }),
        );
    });

    it("debounces search input", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });
        render(<FilterBar filters={{}} onChange={onChange} />);
        await user.type(screen.getByPlaceholderText("Search dishes..."), "bu");
        expect(onChange).not.toHaveBeenCalled();
        act(() => jest.advanceTimersByTime(400));
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ search: "bu" }),
        );
        jest.useRealTimers();
    });

    it("clears search on X click", () => {
        render(
            <FilterBar filters={{ search: "burrata" }} onChange={onChange} />,
        );
        fireEvent.click(screen.getByText("✕"));
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ search: undefined }),
        );
    });

    it("updates maxPrice via dropdown", () => {
        render(<FilterBar filters={{}} onChange={onChange} />);
        fireEvent.change(screen.getByDisplayValue("Any price"), {
            target: { value: "30" },
        });
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ maxPrice: 30 }),
        );
    });
});
