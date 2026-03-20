"use client";

import React from "react";
import { Settings, User, Bell, Shield, Network, Globe, ExternalLink, Info } from "lucide-react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { PremiumButton } from "../../../components/ui/PremiumButton";
import { useEscrow } from "../../../hooks/useEscrow";

export default function SettingsPage() {
  const { address } = useEscrow();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8 text-rsk-orange" />
          Account Settings
        </h1>
        <p className="text-white/50 mt-1">Manage your platform preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar (Local) */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-rsk-orange/10 text-rsk-orange border border-rsk-orange/20 font-medium transition-all">
            <User className="h-5 w-5" />
            Profile & Wallet
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-medium transition-all">
            <Bell className="h-5 w-5" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-medium transition-all">
            <Shield className="h-5 w-5" />
            Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-medium transition-all">
            <Network className="h-5 w-5" />
            Network
          </button>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Wallet Section */}
          <GlassCard className="p-8" hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-rsk-orange/10">
                <Globe className="h-5 w-5 text-rsk-orange" />
              </div>
              <h3 className="text-xl font-bold">Connected Wallet</h3>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-xs text-white/40 font-mono">Primary Address</span>
                <span className="font-mono text-sm tracking-widest mt-1">
                  {address ? address : "Wallet Disconnected"}
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/20" />
            </div>
            
            <p className="text-sm text-white/30 leading-relaxed mb-6">
              This address is used for all escrow transactions. Ensure you have enough RBTC for gas fees on Rootstock.
            </p>

            <div className="flex gap-4">
              <PremiumButton variant="outline" size="sm">
                Change Wallet
              </PremiumButton>
              <PremiumButton variant="ghost" size="sm" onClick={() => window.open(`https://explorer.testnet.rootstock.io/address/${address}`, '_blank')}>
                View on Explorer
                <ExternalLink className="ml-2 h-3 w-3" />
              </PremiumButton>
            </div>
          </GlassCard>

          {/* Network Section */}
          <GlassCard className="p-8" hover={false}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-400/10 text-yellow-500">
                  <Network className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Current Network</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-500 text-[10px] font-bold uppercase tracking-widest border border-yellow-400/20">
                RSK Testnet
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-sm text-white/70">Chain ID</span>
                <span className="text-sm font-mono text-white/40">31</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-sm text-white/70">RPC Provider</span>
                <span className="text-sm font-mono text-white/40">https://public-node.testnet.rsk.co</span>
              </div>
            </div>

            <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-rsk-orange/10 border border-rsk-orange/20">
              <Info className="h-5 w-5 text-rsk-orange shrink-0 mt-0.5" />
              <p className="text-xs text-white/60 leading-relaxed">
                AgentPay RSK is currently optimized for the Rootstock Testnet. Switch to the network in your wallet to interact with the platform.
              </p>
            </div>
          </GlassCard>

          {/* Footer Version Info */}
          <div className="text-center py-4">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">AgentPay RSK v1.0.4 - Secured by Bitcoin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
