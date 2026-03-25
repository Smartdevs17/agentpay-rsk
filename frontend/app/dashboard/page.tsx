"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Clock, CheckCircle2, AlertCircle, Bitcoin, Briefcase, ArrowDownLeft, MessageSquare, Scale, Lock, Wallet, Github, FileText, Bot, X, ExternalLink, ShieldCheck, XCircle } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { PremiumButton } from "../../components/ui/PremiumButton";
import { useWallet } from "../../context/WalletContext";
import type { EscrowJob } from "../../hooks/useEscrow";
import { useToast } from "../../context/ToastContext";
import { formatEther } from "ethers";
import { getScope, saveScope, saveVerification, getAllScopes, type ScopeData } from "../../lib/scopeStore";

type Tab = "client" | "freelancer";

type VerifyResult = {
  verdict: string;
  confidence: number;
  summary: string;
  matchedItems: string[];
  missingItems: string[];
  context: string;
};

export default function DashboardPage() {
  const { address, escrows, freelancerEscrows, loading, error, fetchEscrows, release, refund } = useWallet();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("client");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, number>>({});
  const [scopeData, setScopeData] = useState<Record<string, ScopeData>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  // For adding scope to existing escrows
  const [editingScopeId, setEditingScopeId] = useState<string | null>(null);
  const [editScope, setEditScope] = useState("");
  const [editGithub, setEditGithub] = useState("");

  useEffect(() => {
    if (address) fetchEscrows(address);
  }, [address, fetchEscrows]);

  // Load scope data from localStorage
  useEffect(() => {
    setScopeData(getAllScopes());
  }, [escrows]);

  const applyOptimistic = useCallback((list: EscrowJob[]) =>
    list.map((e) => {
      const override = optimisticUpdates[e.id.toString()];
      return override !== undefined ? { ...e, status: override } : e;
    }), [optimisticUpdates]);

  const stats = useMemo(() => {
    const allClient = applyOptimistic(escrows ?? []);
    const allFreelancer = applyOptimistic(freelancerEscrows ?? []);

    const funded = allClient.filter(e => Number(e.status) === 0);
    const released = allClient.filter(e => Number(e.status) === 1);

    const safeSum = (list: EscrowJob[]) => list.reduce((sum, e) => {
      try { return sum + BigInt(e.amount); } catch { return sum; }
    }, BigInt(0));

    const totalLocked = safeSum(funded);
    const totalReleased = safeSum(released);
    const totalEarned = safeSum(allFreelancer.filter(e => Number(e.status) === 1));

    const safeFormat = (wei: bigint) => {
      try { return parseFloat(formatEther(wei)).toFixed(6); } catch { return "0.000000"; }
    };

    return {
      totalLocked: safeFormat(totalLocked),
      pendingCount: funded.length,
      releasedCount: released.length,
      totalReleased: safeFormat(totalReleased),
      totalEarned: safeFormat(totalEarned),
    };
  }, [escrows, freelancerEscrows, applyOptimistic]);

  const handleRelease = async (id: bigint) => {
    const key = id.toString();
    setActionLoading(`release-${key}`);
    const result = await release(id);
    setActionLoading(null);
    if (result.submitted) {
      setOptimisticUpdates((prev) => ({ ...prev, [key]: 1 }));
      toast("Release submitted! Waiting for confirmation...", "info");
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

  const handleVerify = async (escrowId: string) => {
    const scope = scopeData[escrowId];
    if (!scope?.githubUrl || !scope?.scope) {
      toast("Add a work scope and GitHub link first.", "error");
      return;
    }
    setVerifyingId(escrowId);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl: scope.githubUrl, scope: scope.scope }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Verification failed.", "error");
        return;
      }
      setVerifyResult(data);
      setShowVerifyModal(true);
      saveVerification(escrowId, data.verdict === "PASS" ? "pass" : "fail", data.summary);
      setScopeData(getAllScopes());
    } catch {
      toast("Failed to run verification.", "error");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSaveScope = (escrowId: string) => {
    saveScope(escrowId, editScope, editGithub);
    setScopeData(getAllScopes());
    setEditingScopeId(null);
    setEditScope("");
    setEditGithub("");
    toast("Scope and GitHub link saved!");
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
            <div className="p-3 rounded-xl bg-rsk-orange/10 text-rsk-orange"><Lock className="h-5 w-5" /></div>
          </div>
        </GlassCard>
        <GlassCard delay={0.05}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 mb-1">Pending Release</p>
              <p className="text-xl font-bold">{stats.pendingCount}</p>
              <p className="text-[10px] text-white/30">escrows</p>
            </div>
            <div className="p-3 rounded-xl bg-rsk-yellow/10 text-rsk-yellow"><Clock className="h-5 w-5" /></div>
          </div>
        </GlassCard>
        <GlassCard delay={0.1}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 mb-1">Released</p>
              <p className="text-xl font-bold">{stats.releasedCount}</p>
              <p className="text-[10px] text-white/30">{stats.totalReleased} RBTC</p>
            </div>
            <div className="p-3 rounded-xl bg-rsk-green/10 text-rsk-green"><CheckCircle2 className="h-5 w-5" /></div>
          </div>
        </GlassCard>
        <GlassCard delay={0.15}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 mb-1">Earned as Freelancer</p>
              <p className="text-xl font-bold font-mono">{stats.totalEarned}</p>
              <p className="text-[10px] text-white/30">RBTC</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400"><ArrowDownLeft className="h-5 w-5" /></div>
          </div>
        </GlassCard>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-0">
        <button onClick={() => setTab("client")} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === "client" ? "border-rsk-orange text-rsk-orange" : "border-transparent text-white/40 hover:text-white/70"}`}>
          <Briefcase className="h-4 w-4 inline mr-2" />As Client ({(escrows ?? []).length})
        </button>
        <button onClick={() => setTab("freelancer")} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === "freelancer" ? "border-rsk-orange text-rsk-orange" : "border-transparent text-white/40 hover:text-white/70"}`}>
          <ArrowDownLeft className="h-4 w-4 inline mr-2" />As Freelancer ({(freelancerEscrows ?? []).length})
        </button>
      </div>

      {/* Escrow List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{tab === "client" ? "My Escrows (Client)" : "Assigned to Me (Freelancer)"}</h2>
          {tab === "client" && (
            <PremiumButton variant="outline" size="sm" onClick={() => window.location.href = "/dashboard/new"}>
              <Plus className="h-4 w-4 mr-2" />New Escrow
            </PremiumButton>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (<div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />))}
          </div>
        ) : !isConnected ? (
          <GlassCard className="text-center py-20" hover={false}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center"><Wallet className="h-8 w-8 text-white/20" /></div>
              <p className="text-white/40 max-w-xs mx-auto">Connect your wallet to view and manage your smart contract escrows on Rootstock.</p>
            </div>
          </GlassCard>
        ) : activeList.length === 0 ? (
          <GlassCard className="text-center py-20" hover={false}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center"><Briefcase className="h-8 w-8 text-white/20" /></div>
              <p className="text-white/40">{tab === "client" ? "You haven't created any escrows yet." : "No escrows assigned to you as freelancer."}</p>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeList.map((escrow: EscrowJob) => {
              const status = getStatusLabel(Number(escrow.status));
              const isFunded = Number(escrow.status) === 0;
              const isClient = tab === "client";
              const id = escrow.id.toString();
              const scope = scopeData[id];
              const isEditing = editingScopeId === id;

              return (
                <GlassCard key={id} className="flex flex-col p-6 h-full border-white/5 hover:border-rsk-orange/30 transition-all duration-300">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shadow-inner">
                      <Bitcoin className="h-6 w-6 text-rsk-orange" />
                    </div>
                    <div className="flex items-center gap-2">
                      {scope?.verificationStatus && (
                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${scope.verificationStatus === "pass" ? "bg-rsk-green/10 text-rsk-green" : "bg-rsk-red/10 text-rsk-red"}`}>
                          AI: {scope.verificationStatus}
                        </div>
                      )}
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${status.bg} ${status.color}`}>
                        {status.label}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">
                        {(() => { try { return parseFloat(formatEther(BigInt(escrow.amount))).toFixed(6); } catch { return "0.000000"; } })()}
                      </span>
                      <span className="text-xs font-bold text-white/30 uppercase tracking-widest">RBTC</span>
                    </div>
                    <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Escrow #{id}</p>
                  </div>

                  {/* Scope & GitHub info */}
                  {scope && (scope.scope || scope.githubUrl) && !isEditing && (
                    <div className="mb-4 space-y-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      {scope.scope && (
                        <div className="flex gap-2 items-start">
                          <FileText className="h-3 w-3 text-purple-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-white/50 line-clamp-2">{scope.scope}</p>
                        </div>
                      )}
                      {scope.githubUrl && (
                        <div className="flex gap-2 items-center">
                          <Github className="h-3 w-3 text-white/40 shrink-0" />
                          <a href={scope.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-rsk-orange/70 hover:text-rsk-orange truncate">
                            {scope.githubUrl.replace("https://github.com/", "")}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline scope editor */}
                  {isEditing && (
                    <div className="mb-4 space-y-2 p-3 rounded-lg bg-white/[0.03] border border-purple-500/20">
                      <textarea
                        placeholder="Describe the work scope..."
                        value={editScope}
                        onChange={(e) => setEditScope(e.target.value)}
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50 resize-none"
                      />
                      <input
                        type="url"
                        placeholder="https://github.com/user/repo/pull/1"
                        value={editGithub}
                        onChange={(e) => setEditGithub(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-purple-500/50"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveScope(id)} className="text-[10px] font-bold text-purple-400 hover:text-purple-300">Save</button>
                        <button onClick={() => setEditingScopeId(null)} className="text-[10px] font-bold text-white/30 hover:text-white/50">Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Counterparty */}
                  <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{isClient ? "Freelancer" : "Client"}</span>
                      <span className="font-mono text-[10px] text-white/60 bg-white/5 px-2 py-1 rounded">
                        {(isClient ? escrow.freelancer : escrow.client).slice(0, 8)}...
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {isFunded && isClient && (
                        <>
                          {/* Add scope button if no scope yet */}
                          {!scope?.scope && !isEditing && (
                            <button
                              onClick={() => { setEditingScopeId(id); setEditScope(""); setEditGithub(""); }}
                              className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-purple-400/60 bg-purple-500/5 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-colors"
                            >
                              <FileText className="h-3 w-3" />
                              ADD SCOPE & GITHUB LINK
                            </button>
                          )}
                          {/* Verify with AI button */}
                          {scope?.scope && scope?.githubUrl && (
                            <button
                              onClick={() => handleVerify(id)}
                              disabled={verifyingId === id}
                              className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-purple-400 bg-purple-500/10 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors disabled:opacity-50"
                            >
                              {verifyingId === id ? (
                                <><div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> VERIFYING...</>
                              ) : (
                                <><Bot className="h-3 w-3" /> VERIFY WITH AI</>
                              )}
                            </button>
                          )}
                          <div className="flex gap-2">
                            <PremiumButton variant="primary" size="sm" onClick={() => handleRelease(escrow.id)} isLoading={actionLoading === `release-${id}`} className="flex-1 text-xs">
                              Release
                            </PremiumButton>
                            <PremiumButton variant="ghost" size="sm" onClick={() => handleRefund(escrow.id)} isLoading={actionLoading === `refund-${id}`} className="text-red-400 hover:text-red-300 px-3">
                              Refund
                            </PremiumButton>
                          </div>
                        </>
                      )}
                      {isFunded && !isClient && (
                        <div className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-rsk-yellow/60 bg-rsk-yellow/5 rounded-lg border border-rsk-yellow/10">
                          <Clock className="h-3 w-3" />AWAITING RELEASE
                        </div>
                      )}
                      {!isFunded && (
                        <div className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-white/20 bg-white/5 rounded-lg border border-white/5">
                          <CheckCircle2 className="h-3 w-3" />SETTLED
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Dispute Resolution — Coming Soon */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Dispute Resolution</h2>
        <GlassCard className="relative overflow-hidden" hover={false}>
          <div className="absolute inset-0 bg-gradient-to-r from-rsk-orange/5 to-purple-500/5 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0"><Scale className="h-7 w-7 text-purple-400" /></div>
              <div>
                <h3 className="font-bold text-lg">Arbitration & Messaging</h3>
                <p className="text-sm text-white/50 mt-1 max-w-md">Dispute a payment, message the other party, or request a third-party arbitrator to mediate.</p>
              </div>
            </div>
            <div className="sm:ml-auto flex flex-col items-start sm:items-end gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">Coming Soon</span>
              <div className="flex gap-3 text-white/30 text-xs">
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> In-app Chat</span>
                <span className="flex items-center gap-1"><Scale className="h-3 w-3" /> Arbitration</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* AI Verification Result Modal */}
      {showVerifyModal && verifyResult && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowVerifyModal(false)}>
          <div className="bg-rsk-card border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-purple-400" />
                <h3 className="text-lg font-bold">AI Verification Result</h3>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="p-1 rounded-lg hover:bg-white/5 text-white/40"><X className="h-5 w-5" /></button>
            </div>

            {/* Verdict */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${verifyResult.verdict === "PASS" ? "bg-rsk-green/10 border-rsk-green/20" : "bg-rsk-red/10 border-rsk-red/20"}`}>
              {verifyResult.verdict === "PASS" ? (
                <ShieldCheck className="h-10 w-10 text-rsk-green" />
              ) : (
                <XCircle className="h-10 w-10 text-rsk-red" />
              )}
              <div>
                <p className={`text-2xl font-bold ${verifyResult.verdict === "PASS" ? "text-rsk-green" : "text-rsk-red"}`}>
                  {verifyResult.verdict}
                </p>
                <p className="text-xs text-white/40">{verifyResult.confidence}% confidence &middot; {verifyResult.context}</p>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-white/70 leading-relaxed">{verifyResult.summary}</p>

            {/* Matched items */}
            {verifyResult.matchedItems.length > 0 && (
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2">Scope Items Matched</p>
                <ul className="space-y-1">
                  {verifyResult.matchedItems.map((item, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-rsk-green/80">
                      <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing items */}
            {verifyResult.missingItems.length > 0 && (
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2">Missing / Incomplete</p>
                <ul className="space-y-1">
                  {verifyResult.missingItems.map((item, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-rsk-red/80">
                      <XCircle className="h-3 w-3 shrink-0 mt-0.5" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <PremiumButton variant="ghost" size="sm" onClick={() => setShowVerifyModal(false)}>Close</PremiumButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
