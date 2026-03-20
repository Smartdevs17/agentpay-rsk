import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { WalletProvider } from "../context/WalletContext";
import { ToastProvider } from "../context/ToastContext";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "AgentPay RSK — Freelance Escrow",
  description: "Trustless RBTC escrow for freelancers on Rootstock",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${sora.variable} font-sans antialiased bg-rsk-dark text-white selection:bg-rsk-orange/30`}>
        <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="fixed inset-0 bg-radial-gradient opacity-40 pointer-events-none" />
        <WalletProvider>
          <ToastProvider>
            <div className="relative z-10">{children}</div>
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
