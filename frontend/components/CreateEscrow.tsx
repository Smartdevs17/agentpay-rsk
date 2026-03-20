"use client";
import { useState } from "react";

type Props = {
  connected: boolean;
  loading: boolean;
  onCreate: (freelancer: string, amount: string) => Promise<boolean>;
};

export default function CreateEscrow({ connected, loading, onCreate }: Props) {
  const [freelancer, setFreelancer] = useState("");
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const ok = await onCreate(freelancer, amount);
    if (ok) {
      setSuccess(true);
      setFreelancer("");
      setAmount("");
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <section className="bg-rsk-card border border-rsk-border rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Create Escrow</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-rsk-gray mb-1">Freelancer Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={freelancer}
            onChange={(e) => setFreelancer(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-rsk-dark border border-rsk-border text-white font-mono text-sm placeholder:text-rsk-gray/50 focus:outline-none focus:border-rsk-orange transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-rsk-gray mb-1">Amount (RBTC)</label>
          <input
            type="text"
            placeholder="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-rsk-dark border border-rsk-border text-white font-mono text-sm placeholder:text-rsk-gray/50 focus:outline-none focus:border-rsk-orange transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!connected || loading || !freelancer || !amount}
          className="w-full py-2.5 rounded-lg font-medium text-sm transition-colors bg-rsk-orange hover:bg-rsk-orange-light text-black disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Locking Funds..." : "Lock Funds"}
        </button>
        {success && (
          <p className="text-rsk-green text-sm text-center">Escrow created successfully!</p>
        )}
      </form>
    </section>
  );
}
