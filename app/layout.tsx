import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWAYS · Field Station — Grade A OpenStreetMap services",
  description:
    "AWAYS makes public outdoor data accurate — every trail mapped, every connector included, every closure reflected, every name correct. The work lives in OpenStreetMap and stays open.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
