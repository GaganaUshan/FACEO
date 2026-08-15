import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import LoadingScreen from "@/components/LoadingScreen";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Faceo Analytics | Face Intelligence Platform",
  description: "A state-of-the-art AI platform for facial emotion detection, demographic estimation, bruise analysis, and deepfake verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-black text-white min-h-screen selection:bg-white/20`}>
        <CustomCursor />
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
