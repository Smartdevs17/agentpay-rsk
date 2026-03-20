"use client";
import { EscrowJob } from "../hooks/useEscrow";
import { shortenAddress, formatRBTC, statusLabel, statusColor } from "../lib/utils";

type Props = {
  escrow: EscrowJob;
  loading: boolean;
  onRelease: (id: bigint) => Promise<boolean>;
  onRefund: (id: bigint) => Promise<boolean>;
};

export default function EscrowCard({ escrow, loading, onRelease, onRefund }: Props) {
  const isFunded = escrow.status === 0;

  return (
    <div className="bg-rsk-card border border-rsk-border rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-rsk-gray text-sm">Escrow #{escrow.id.toString()}</span>
        <span className={`text-sm font-semibold ${statusColor(escrow.status)}`}>
          {statusLabel(escrow.status)}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-rsk-gray">Freelancer</span>
          <span className="font-mono">{shortenAddress(escrow.freelancer)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-rsk-gray">Amount</span>
          <span className="font-mono">{formatRBTC(escrow.amount)} RBTC</span>
        </div>
      </div>

      {isFunded && (
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onRelease(escrow.id)}
            disabled={loading}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-rsk-green/15 text-rsk-green hover:bg-rsk-green/25 transition-colors disabled:opacity-40"
          >
            Release
          </button>
          <button
            onClick={() => onRefund(escrow.id)}
            disabled={loading}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-rsk-red/15 text-rsk-red hover:bg-rsk-red/25 transition-colors disabled:opacity-40"
          >
            Refund
          </button>
        </div>
      )}
    </div>
  );
}
