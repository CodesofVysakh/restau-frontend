import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
    title: "Ember — Digital Dining",
    description: "Fine dining, reimagined.",
};
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
