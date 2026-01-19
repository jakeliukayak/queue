import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MT2.0 Queuing System",
  description: "Schedule a 1-on-1 CV consultation session with our head coach Jake",
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
