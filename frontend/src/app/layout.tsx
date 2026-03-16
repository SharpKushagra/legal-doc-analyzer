import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "./providers";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Clause Sense | Enterprise AI Legal Assistant",
  description: "Clause Sense — Advanced AI-powered legal document analysis, risk extraction, and compliance checking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        inter.variable,
        outfit.variable,
        "min-h-screen bg-background font-sans antialiased selection:bg-primary/20"
      )}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
