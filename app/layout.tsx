import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IGHub Kids Code Camp 2026",
  description: "August 2026 Kids Code Camp registration for Aba, Umuahia and Live Online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
