"use client";

import React, { useEffect } from "react";
import { History, Filter, Search, ArrowUpRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { useEscrow, EscrowJob } from "../../../hooks/useEscrow";
import { motion, AnimatePresence } from "framer-motion";

const StatusBadge = ({ status }: { status: number }) => {
  const configs = [
    { label: "Locked", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Clock },
    { label: "Released", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle2 },
    { label: "Refunded", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
  ];
  const config = configs[status] || configs[0];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

export default function HistoryPage() {
  const { address, escrows, fetchEscrows, loading } = useEscrow();

  useEffect(() => {
    if (address) {
      fetchEscrows(address);
    }
  }, [address, fetchEscrows]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <History className="h-8 w-8 text-rsk-orange" />
            Transaction History
          </h1>
          <p className="text-white/50 mt-1 text-sm">Review your past escrows and payment activities on Rootstock.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search by address..." 
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-rsk-orange/50 transition-colors w-full sm:w-64"
            />
          </div>
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Filter className="h-5 w-5 text-white/50" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard className="p-4" hover={false}>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Lifetime Volume</p>
          <p className="text-2xl font-bold">
            {escrows.reduce((acc, job) => acc + Number(job.amount), 0) / 1e18} <span className="text-sm text-rsk-orange">RBTC</span>
          </p>
        </GlassCard>
        <GlassCard className="p-4" hover={false}>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Jobs</p>
          <p className="text-2xl font-bold">{escrows.length}</p>
        </GlassCard>
        <GlassCard className="p-4" hover={false}>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Completion Rate</p>
          <p className="text-2xl font-bold">
            {escrows.length > 0 
              ? Math.round((escrows.filter(j => j.status === 1).length / escrows.length) * 100) 
              : 0}%
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-0 overflow-hidden" hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-white/70">Escrow ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/70">Freelancer</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/70">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/70">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/70">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {escrows.length > 0 ? (
                  escrows.map((job, i) => (
                    <motion.tr 
                      key={job.id.toString()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-sm text-white/50">#{job.id.toString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-rsk-orange/10 flex items-center justify-center text-[10px] text-rsk-orange font-bold">
                            {job.freelancer.slice(2, 4).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">{job.freelancer.slice(0, 6)}...{job.freelancer.slice(-4)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-rsk-orange">{(Number(job.amount) / 1e18).toFixed(4)} RBTC</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/40">
                        {new Date(Number(job.createdAt) * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all">
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      {loading ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-rsk-orange border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm text-white/30">Fetching transactions...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <History className="h-12 w-12 text-white/5" />
                          <p className="text-white/30">No transactions found for this account.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
