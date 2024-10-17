import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import TanstackProvider from "@/providers/tanstack.provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Pixel Mind",
    description: "Cloudflare is Awesome",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <TanstackProvider>
                    <main>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            enableSystem
                            disableTransitionOnChange
                        >
                            {children}
                        </ThemeProvider>
                    </main>
                    <Toaster />
                </TanstackProvider>
            </body>
        </html>
    );
}
