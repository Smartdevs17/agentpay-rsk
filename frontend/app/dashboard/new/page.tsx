"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, ShieldCheck, Zap, Info, WalletIcon, CheckCircle2, FileText, Github, Bot } from "lucide-react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { PremiumButton } from "../../../components/ui/PremiumButton";
import { useWallet } from "../../../context/WalletContext";
import { useToast } from "../../../context/ToastContext";
import { saveScope } from "../../../lib/scopeStore";

export default function NewEscrowPage() {
  const router = useRouter();
  const { createEscrow, address, fetchEscrows, addPendingEscrow } = useWallet();
  const { toast } = useToast();
  const [freelancer, setFreelancer] = useState("");
  const [amount, setAmount] = useState("");
  const [scope, setScope] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freelancer || !amount || submitting) return;

    setSubmitting(true);
    const lockedAmount = amount;
    const savedScope = scope;
    const savedGithub = githubUrl;

    const savedFreelancer = freelancer;
    const result = await createEscrow(savedFreelancer, lockedAmount);
    if (result.submitted) {
      // Clear form immediately
      setFreelancer("");
      setAmount("");
      setScope("");
      setGithubUrl("");

      // Add pending card to dashboard immediately
      if (address) addPendingEscrow(savedFreelancer, lockedAmount, address);

      // Toast first, then navigate
      toast(`Transaction submitted! Locking ${lockedAmount} RBTC...`, "info");
      router.push("/dashboard");

      // Wait for mining in background
      result.wait().then(async (confirmed) => {
        if (confirmed) {
          // Save scope FIRST so it's available when dashboard re-renders
          if (savedScope || savedGithub) {
            try {
              const { ethers } = await import("ethers");
              const { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } = await import("../../../lib/contract");
              const provider = new ethers.BrowserProvider(window.ethereum!);
              const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider);
              const count = await contract.escrowCount();
              const newId = (Number(count) - 1).toString();
              saveScope(newId, savedScope, savedGithub);
            } catch {
              // Scope save failed — not critical
            }
          }
          toast(`Escrow confirmed on-chain! ${lockedAmount} RBTC locked.`);
          if (address) fetchEscrows(address);
        }
      });
    } else {
      toast("Failed to submit transaction.", "error");
    }
    setSubmitting(false);
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

              {/* Work Scope */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-400" />
                  Work Scope
                  <span className="text-[10px] text-white/30 ml-1">(optional)</span>
                </label>
                <textarea
                  placeholder="Describe the deliverables — e.g. 'Build a REST API with auth endpoints, deploy to staging, write unit tests for all routes.'"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors text-sm resize-none"
                />
                <p className="text-[10px] text-white/30">The AI agent will verify GitHub commits against this scope before you release funds.</p>
              </div>

              {/* GitHub URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Repository / PR Link
                  <span className="text-[10px] text-white/30 ml-1">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/user/repo or .../pull/1"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-white/30 transition-colors text-sm font-mono"
                />
                <p className="text-[10px] text-white/30">Link a public repo, PR, or commit for AI-powered work verification.</p>
              </div>

              <div className="pt-6 border-t border-white/5">
                <PremiumButton
                  type="submit"
                  variant="premium"
                  className="w-full h-14 text-lg"
                  isLoading={submitting}
                  disabled={!address || submitting}
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

        {/* Right Column: Info */}
        <div className="space-y-6">
          {/* AI Verification Info */}
          <GlassCard className="p-6 bg-purple-500/5 border-purple-500/10" hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <Bot className="h-6 w-6 text-purple-400" />
              <h3 className="font-bold">AI Work Verification</h3>
            </div>
            <p className="text-sm text-white/50 mb-4">
              Define a scope and link a GitHub PR — our AI agent will analyze the code changes to verify if the freelancer's work matches what was agreed upon.
            </p>
            <div className="space-y-2">
              <div className="flex gap-2 items-start text-xs text-white/40">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Analyzes PR diffs and commit history</span>
              </div>
              <div className="flex gap-2 items-start text-xs text-white/40">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Checks scope items against code changes</span>
              </div>
              <div className="flex gap-2 items-start text-xs text-white/40">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Provides confidence score and breakdown</span>
              </div>
            </div>
          </GlassCard>

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
                <p className="text-xs text-white/40">Define the work scope and link a GitHub repo or PR.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <p className="text-xs text-white/40">Lock RBTC — the smart contract holds funds trustlessly.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                <p className="text-xs text-white/40">Run AI verification on the PR, then release with confidence.</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
