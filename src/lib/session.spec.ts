import { formatPrice, formatTime, timeAgo } from "./session";

describe("formatPrice", () => {
    it("formats zero", () => expect(formatPrice(0)).toBe("$0.00"));
    it("formats integer", () => expect(formatPrice(16)).toBe("$16.00"));
    it("formats decimal", () => expect(formatPrice(34.56)).toBe("$34.56"));
    it("formats large with commas", () =>
        expect(formatPrice(1234.5)).toBe("$1,234.50"));
});

describe("formatTime", () => {
    it("returns AM/PM string", () =>
        expect(formatTime("2024-06-15T14:30:00.000Z")).toMatch(/AM|PM/));
    it("returns non-empty string", () =>
        expect(formatTime(new Date().toISOString()).length).toBeGreaterThan(0));
});

describe("timeAgo", () => {
    it('returns "just now" for < 1 min', () =>
        expect(timeAgo(new Date(Date.now() - 30000).toISOString())).toBe(
            "just now",
        ));
    it('returns "1 min ago"', () =>
        expect(timeAgo(new Date(Date.now() - 65000).toISOString())).toBe(
            "1 min ago",
        ));
    it('returns "X mins ago"', () =>
        expect(timeAgo(new Date(Date.now() - 5 * 60000).toISOString())).toBe(
            "5 mins ago",
        ));
    it("returns hours format", () =>
        expect(
            timeAgo(
                new Date(Date.now() - 2 * 3600000 - 15 * 60000).toISOString(),
            ),
        ).toMatch(/^2h/));
});
