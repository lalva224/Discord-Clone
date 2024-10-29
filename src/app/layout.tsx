import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "./convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import Head from 'next/head';
import { Toaster } from "sonner";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net https://clerk.accounts.dev https://probable-sheep-38.accounts.dev https://probable-sheep-38.clerk.accounts.dev scdn.clerk.com segapi.clerk.com;"
        />
      </Head>
  
      <body
      >
        <ClerkProvider dynamic>
        <ConvexClientProvider>
          {children}
          <Toaster/>
        </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
