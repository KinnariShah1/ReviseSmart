import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { OPTIMIZED_FONT_PROVIDERS } from "next/dist/shared/lib/constants";
import { Provider } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import Navbar1 from "@/components/Navbar1";

const lexend = Lexend({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Revise Smart",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={cn(
          lexend.className, 'antialiased min-h-screen pt-16'
        )}
      > 
        <Provider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar/>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}

