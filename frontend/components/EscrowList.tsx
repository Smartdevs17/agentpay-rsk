"use client";
import { EscrowJob } from "../hooks/useEscrow";
import EscrowCard from "./EscrowCard";

type Props = {
  escrows: EscrowJob[];
  loading: boolean;
  onRelease: (id: bigint) => Promise<boolean>;
  onRefund: (id: bigint) => Promise<boolean>;
};

export default function EscrowList({ escrows, loading, onRelease, onRefund }: Props) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">My Escrows</h2>
      {escrows.length === 0 ? (
        <p className="text-rsk-gray text-sm">No escrows found for your wallet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {escrows.map((e) => (
            <EscrowCard
              key={e.id.toString()}
              escrow={e}
              loading={loading}
              onRelease={onRelease}
              onRefund={onRefund}
            />
          ))}
        </div>
      )}
    </section>
  );
}
