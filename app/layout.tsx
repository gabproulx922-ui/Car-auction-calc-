import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copart BidCalc MVP",
  description: "VIN decode + Copart fees + QC taxes + profit ladder + deal queue",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
