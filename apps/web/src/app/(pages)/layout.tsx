import type { Metadata } from "next";
import { Caudex, Didact_Gothic, Handlee } from "next/font/google";

import "./globals.css";


const caudex = Caudex({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caudex",
  weight: "400",
})

const handlee = Handlee({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-handlee",
  weight: "400",
})

const didactGothic = Didact_Gothic({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-didact-gothic",
  weight: "400",
})

export const metadata: Metadata = {
  title: "Squad Draw",
  description: "Collaborative drawing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={` ${caudex.variable} ${handlee.variable} ${didactGothic.variable}  
        `}
      >
        {children}
      </body>
    </html>
  );
}
