import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "AWAYS — Professional Grade A mapping",
  description:
    "AWAYS makes outdoor data Grade A: every trail mapped, every connector included, every closure reflected. OpenStreetMap-native, organization-funded.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-canvas text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
