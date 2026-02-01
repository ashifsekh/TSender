import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "TSender",
  description: "ERC20 token sender",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
