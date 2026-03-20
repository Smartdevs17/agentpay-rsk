"use client";

import React from "react";
import { Shield, Menu } from "lucide-react";
import { PremiumButton } from "../ui/PremiumButton";

interface DashboardHeaderProps {
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onMenuClick?: () => void;
}

export const DashboardHeader = ({ address, onConnect, onDisconnect, onMenuClick }: DashboardHeaderProps) => {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 px-4 sm:px-8 py-4 bg-rsk-dark/50 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>

        <div className="flex-1 lg:hidden ml-4">
          <span className="font-bold text-lg">Agent<span className="text-rsk-orange">Pay</span></span>
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-3 ml-auto">
          <PremiumButton
            variant={address ? "outline" : "premium"}
            size="sm"
            onClick={address ? undefined : onConnect}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {address ? (
              <span className="font-mono text-xs">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            ) : (
              "Connect Wallet"
            )}
          </PremiumButton>
        </div>
      </div>
    </header>
  );
};
