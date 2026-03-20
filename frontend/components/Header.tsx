"use client";
import { shortenAddress } from "../lib/utils";

type HeaderProps = {
  address: string | null;
  onConnect: () => void;
};

export default function Header({ address, onConnect }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-rsk-border">
      <div className="flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#FF6B00" />
          <text x="16" y="21" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" fontFamily="Sora, sans-serif">R</text>
        </svg>
        <span className="text-lg font-semibold tracking-tight">AgentPay RSK</span>
      </div>
      <button
        onClick={onConnect}
        className="px-5 py-2 rounded-lg font-medium text-sm transition-colors bg-rsk-orange hover:bg-rsk-orange-light text-black"
      >
        {address ? shortenAddress(address) : "Connect Wallet"}
      </button>
    </header>
  );
}
