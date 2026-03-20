"use client";

import React, { createContext, useContext } from "react";
import { useEscrow, EscrowJob } from "../hooks/useEscrow";

type WalletContextType = ReturnType<typeof useEscrow>;

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const escrow = useEscrow();
  return (
    <WalletContext.Provider value={escrow}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}
