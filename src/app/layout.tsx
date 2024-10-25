import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "./convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        <ClerkProvider dynamic>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
