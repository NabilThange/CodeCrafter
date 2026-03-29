import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unified Platform",
  description: "AI Search, Portfolio Management, and Global Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
