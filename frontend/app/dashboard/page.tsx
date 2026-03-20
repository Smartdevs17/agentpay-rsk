"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, DollarSign, Clock, CheckCircle2, AlertCircle, Bitcoin, Briefcase, ArrowDownLeft, MessageSquare, Scale, Lock } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { PremiumButton } from "../../components/ui/PremiumButton";
import { useWallet } from "../../context/WalletContext";
import type { EscrowJob } from "../../hooks/useEscrow";
import { useToast } from "../../context/ToastContext";
import { formatEther } from "ethers";

type Tab = "client" | "freelancer";

export default function DashboardPage() {
  const { address, escrows, freelancerEscrows, loading, error, fetchEscrows, release, refund } = useWallet();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("client");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // Local optimistic state overlays on top of contract data
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, number>>({});

  useEffect(() => {
    if (address) fetchEscrows(address);
  }, [address, fetchEscrows]);

  // Apply optimistic status overrides
  const applyOptimistic = useCallback((list: EscrowJob[]) =>
    list.map((e) => {
      const override = optimisticUpdates[e.id.toString()];
      return override !== undefined ? { ...e, status: override } : e;
    }), [optimisticUpdates]);

  // Real stats computed from contract data + optimistic overrides
  const stats = useMemo(() => {
    const allClient = applyOptimistic(escrows ?? []);
    const allFreelancer = applyOptimistic(freelancerEscrows ?? []);

    const funded = allClient.filter(e => Number(e.status) === 0);
    const released = allClient.filter(e => Number(e.status) === 1);
    const refunded = allClient.filter(e => Number(e.status) === 2);

    const totalLocked = funded.reduce((sum, e) => sum + e.amount, BigInt(0));
    const totalReleased = released.reduce((sum, e) => sum + e.amount, BigInt(0));
    const totalEarned = allFreelancer
      .filter(e => Number(e.status) === 1)
      .reduce((sum, e) => sum + e.amount, BigInt(0));

    return {
      totalLocked: parseFloat(formatEther(totalLocked)).toFixed(6),
      pendingCount: funded.length,
      releasedCount: released.length,
      refundedCount: refunded.length,
      totalReleased: parseFloat(formatEther(totalReleased)).toFixed(6),
      totalEarned: parseFloat(formatEther(totalEarned)).toFixed(6),
      freelancerPending: allFreelancer.filter(e => Number(e.status) === 0).length,
    };
  }, [escrows, freelancerEscrows, applyOptimistic]);

  const handleRelease = async (id: bigint) => {
    const key = id.toString();
    setActionLoading(`release-${key}`);
    const result = await release(id);
    setActionLoading(null);
    if (result.submitted) {
      // Optimistic: update UI immediately after wallet signs
      setOptimisticUpdates((prev) => ({ ...prev, [key]: 1 }));
      toast("Release submitted! Waiting for confirmation...", "info");
      // Wait for mining in background
      result.wait().then((confirmed) => {
        if (confirmed) {
          toast("Funds released to freelancer!");
          if (address) fetchEscrows(address).then(() => setOptimisticUpdates((prev) => { const next = { ...prev }; delete next[key]; return next; }));
        }
      });
    } else {
      toast("Release failed. Check the error above.", "error");
    }
  };

  const handleRefund = async (id: bigint) => {
    const key = id.toString();
    setActionLoading(`refund-${key}`);
    const result = await refund(id);
    setActionLoading(null);
    if (result.submitted) {
      setOptimisticUpdates((prev) => ({ ...prev, [key]: 2 }));
      toast("Refund submitted! Waiting for confirmation...", "info");
      result.wait().then((confirmed) => {
        if (confirmed) {
          toast("Escrow refunded to your wallet!");
          if (address) fetchEscrows(address).then(() => setOptimisticUpdates((prev) => { const next = { ...prev }; delete next[key]; return next; }));
        }
      });
    } else {
      toast("Refund failed. Check the error above.", "error");
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return { label: "Funded", color: "text-rsk-yellow", bg: "bg-rsk-yellow/10" };
      case 1: return { label: "Released", color: "text-rsk-green", bg: "bg-rsk-green/10" };
      case 2: return { label: "Refunded", color: "text-red-400", bg: "bg-red-400/10" };
      default: return { label: "Unknown", color: "text-white/40", bg: "bg-white/5" };
    }
  };

  const clientList = applyOptimistic(escrows ?? []);
  const freelancerList = applyOptimistic(freelancerEscrows ?? []);
  const activeList = tab === "client" ? clientList : freelancerList;
  const isConnected = !!address;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-white/50">
            {isConnected
              ? `Connected: ${address!.slice(0, 6)}...${address!.slice(-4)}`
              : "Connect your wallet to view real data"}
          </p>
        </div>
        {!isConnected && (
          <div className="px-4 py-2 rounded-full bg-rsk-orange/10 border border-rsk-orange/20 text-rsk-orange text-xs font-bold animate-pulse">
            WALLET NOT CONNECTED
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-red-100 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard delay={0}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 mb-1">Locked in Escrow</p>
              <p className="text-xl font-bold font-mono">{stats.totalLocked}</p>
              <p className="text-[10px] text-white/30">RBTC</p>
            </div>
            <div className="p-3 rounded-xl bg-rsk-orange/10 text-rsk-orange">
              <Lock className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.05}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 mb-1">Pending Release</p>
              <p className="text-xl font-bold">{stats.pendingCount}</p>
              <p className="text-[10px] text-white/30">escrows</p>
            </div>
            <div className="p-3 rounded-xl bg-rsk-yellow/10 text-rsk-yellow">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.1}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 mb-1">Released</p>
              <p className="text-xl font-bold">{stats.releasedCount}</p>
              <p className="text-[10px] text-white/30">{stats.totalReleased} RBTC</p>
            </div>
            <div className="p-3 rounded-xl bg-rsk-green/10 text-rsk-green">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.15}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 mb-1">Earned as Freelancer</p>
              <p className="text-xl font-bold font-mono">{stats.totalEarned}</p>
              <p className="text-[10px] text-white/30">RBTC</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-0">
        <button
          onClick={() => setTab("client")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "client"
              ? "border-rsk-orange text-rsk-orange"
              : "border-transparent text-white/40 hover:text-white/70"
          }`}
        >
          <Briefcase className="h-4 w-4 inline mr-2" />
          As Client ({(escrows ?? []).length})
        </button>
        <button
          onClick={() => setTab("freelancer")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "freelancer"
              ? "border-rsk-orange text-rsk-orange"
              : "border-transparent text-white/40 hover:text-white/70"
          }`}
        >
          <ArrowDownLeft className="h-4 w-4 inline mr-2" />
          As Freelancer ({(freelancerEscrows ?? []).length})
        </button>
      </div>

      {/* Escrow List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {tab === "client" ? "My Escrows (Client)" : "Assigned to Me (Freelancer)"}
          </h2>
          {tab === "client" && (
            <PremiumButton variant="outline" size="sm" onClick={() => window.location.href = "/dashboard/new"}>
              <Plus className="h-4 w-4 mr-2" />
              New Escrow
            </PremiumButton>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !isConnected ? (
          <GlassCard className="text-center py-12" hover={false}>
            <p className="text-white/40">Connect your wallet to view escrows.</p>
          </GlassCard>
        ) : activeList.length === 0 ? (
          <GlassCard className="text-center py-12" hover={false}>
            <p className="text-white/40">
              {tab === "client"
                ? "You haven't created any escrows yet."
                : "No escrows assigned to you as freelancer."}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeList.map((escrow: EscrowJob, i: number) => {
              const status = getStatusLabel(Number(escrow.status));
              const isFunded = Number(escrow.status) === 0;
              const isClient = tab === "client";
              return (
                <GlassCard key={escrow.id.toString()} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Bitcoin className="h-6 w-6 text-rsk-orange" />
                    </div>
                    <div>
                      <p className="font-bold">{parseFloat(formatEther(escrow.amount)).toFixed(6)} RBTC</p>
                      <p className="text-xs text-white/40 font-mono">Escrow #{escrow.id.toString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <p className="text-sm">
                      {isClient ? "Freelancer" : "Client"}:{" "}
                      <span className="font-mono text-xs text-white/60">
                        {(isClient ? escrow.freelancer : escrow.client).slice(0, 6)}...
                        {(isClient ? escrow.freelancer : escrow.client).slice(-4)}
                      </span>
                    </p>
                    <div className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block ${status.bg} ${status.color}`}>
                      {status.label}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isFunded && isClient && (
                      <>
                        <PremiumButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleRelease(escrow.id)}
                          isLoading={actionLoading === `release-${escrow.id.toString()}`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          Release
                        </PremiumButton>
                        <PremiumButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefund(escrow.id)}
                          isLoading={actionLoading === `refund-${escrow.id.toString()}`}
                          className="text-red-400 hover:text-red-300"
                        >
                          Refund
                        </PremiumButton>
                      </>
                    )}
                    {isFunded && !isClient && (
                      <span className="text-xs text-rsk-yellow/80 bg-rsk-yellow/10 px-3 py-1.5 rounded-lg">
                        Awaiting client action
                      </span>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Dispute / Arbitration — Coming Soon */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Dispute Resolution</h2>
        <GlassCard className="relative overflow-hidden" hover={false}>
          <div className="absolute inset-0 bg-gradient-to-r from-rsk-orange/5 to-purple-500/5 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Scale className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Arbitration & Messaging</h3>
                <p className="text-sm text-white/50 mt-1 max-w-md">
                  Dispute a payment, message the other party, or request a third-party arbitrator to mediate. Fair resolution, on-chain.
                </p>
              </div>
            </div>
            <div className="sm:ml-auto flex flex-col items-start sm:items-end gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                Coming Soon
              </span>
              <div className="flex gap-3 text-white/30 text-xs">
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> In-app Chat</span>
                <span className="flex items-center gap-1"><Scale className="h-3 w-3" /> Arbitration</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
