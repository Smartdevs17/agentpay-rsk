"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, ShieldCheck, Zap, Info, WalletIcon, CheckCircle2 } from "lucide-react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { PremiumButton } from "../../../components/ui/PremiumButton";
import { useWallet } from "../../../context/WalletContext";
import { useToast } from "../../../context/ToastContext";

export default function NewEscrowPage() {
  const router = useRouter();
  const { createEscrow, loading, address, fetchEscrows } = useWallet();
  const { toast } = useToast();
  const [freelancer, setFreelancer] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freelancer || !amount) return;

    const lockedAmount = amount;
    const result = await createEscrow(freelancer, lockedAmount);
    if (result.submitted) {
      // Tx signed — clear form and navigate
      setFreelancer("");
      setAmount("");
      router.push("/dashboard");

      // Toast after navigation settles
      setTimeout(() => {
        toast(`Transaction submitted! Locking ${lockedAmount} RBTC...`, "info");
      }, 100);

      // Wait for mining in background, then confirm
      result.wait().then((confirmed) => {
        if (confirmed) {
          toast(`Escrow confirmed on-chain! ${lockedAmount} RBTC locked.`);
          if (address) fetchEscrows(address);
        }
      });
    } else {
      toast("Failed to submit transaction.", "error");
    }
  };

  return (
    <div className="py-8">
      <PremiumButton 
        variant="ghost" 
        size="sm" 
        onClick={() => router.back()}
        className="mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </PremiumButton>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rsk-orange/10 flex items-center justify-center">
                <Send className="h-6 w-6 text-rsk-orange" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create New Escrow</h1>
                <p className="text-white/50 text-sm">Deploy a secure payment rail on Rootstock</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <WalletIcon className="h-4 w-4" />
                  Freelancer Wallet Address
                </label>
                <input 
                  type="text"
                  placeholder="0x..."
                  value={freelancer}
                  onChange={(e) => setFreelancer(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-rsk-orange/50 transition-colors font-mono text-sm"
                  required
                />
                <p className="text-[10px] text-white/30">The RBTC address where funds will be released after verification.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  Deposit Amount
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.0001"
                    placeholder="0.05"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-rsk-orange/50 transition-colors text-lg"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">RBTC</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <PremiumButton 
                  type="submit" 
                  variant="premium" 
                  className="w-full h-14 text-lg"
                  isLoading={loading}
                  disabled={!address}
                >
                  <Send className="mr-2 h-5 w-5" />
                  Fund & Create Escrow
                </PremiumButton>
                {!address && (
                  <p className="text-center text-xs text-red-400 mt-3 animate-pulse">
                    Please connect your wallet to interact with Rootstock
                  </p>
                )}
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: Info/Summary */}
        <div className="space-y-6">
          <GlassCard className="p-6 bg-rsk-orange/5 border-rsk-orange/10" hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-rsk-orange" />
              <h3 className="font-bold">Security Guarantee</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-white/70">
                <CheckCircle2 className="h-4 w-4 text-rsk-orange shrink-0 mt-0.5" />
                <span>Funds are locked in a non-custodial smart contract on Rootstock.</span>
              </li>
              <li className="flex gap-3 text-sm text-white/70">
                <CheckCircle2 className="h-4 w-4 text-rsk-orange shrink-0 mt-0.5" />
                <span>Only you (the client) can trigger the release or a refund.</span>
              </li>
              <li className="flex gap-3 text-sm text-white/70">
                <CheckCircle2 className="h-4 w-4 text-rsk-orange shrink-0 mt-0.5" />
                <span>Inherits the full hash power security of the Bitcoin network.</span>
              </li>
            </ul>
          </GlassCard>

          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center gap-3 mb-4 text-white/50">
              <Info className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">How it works</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                <p className="text-xs text-white/40">Enter the freelancer's wallet address and deposit the agreed amount in RBTC.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <p className="text-xs text-white/40">The smart contract locks the funds, creating a trustless bond.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                <p className="text-xs text-white/40">Once work is received, go to your dashboard and click "Release".</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
