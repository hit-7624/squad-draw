import type { Metadata } from "next";
import { Caudex, Didact_Gothic, Handlee } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const caudex = Caudex({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caudex",
  weight: "400",
});

const handlee = Handlee({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-handlee",
  weight: "400",
});

const didactGothic = Didact_Gothic({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-didact-gothic",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Squad Draw",
  description: "Collaborative drawing platform",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${caudex.variable} ${handlee.variable} ${didactGothic.variable}`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster
            richColors
            position="top-right"
            duration={3000}
            expand={false}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
