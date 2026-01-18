import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Queue System",
  description: "Modern minimalist queuing system",
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
