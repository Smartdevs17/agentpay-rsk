"use client";
import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS, RSK_TESTNET } from "../lib/contract";

export type EscrowJob = {
  id: bigint;
  client: string;
  freelancer: string;
  amount: bigint;
  status: number;
  createdAt: bigint;
};

function parseError(err: any): string {
  const msg = err?.message || err?.reason || String(err);
  if (msg.includes("user rejected") || msg.includes("ACTION_REJECTED") || err?.code === 4001 || err?.code === "ACTION_REJECTED") {
    return "Transaction rejected by user.";
  }
  if (msg.includes("insufficient funds")) {
    return "Insufficient RBTC balance for this transaction.";
  }
  if (msg.includes("Not the client")) {
    return "Only the escrow client can perform this action.";
  }
  if (msg.includes("not in Funded state")) {
    return "This escrow has already been settled.";
  }
  if (msg.includes("network") || msg.includes("timeout")) {
    return "Network error. Please check your connection and try again.";
  }
  // Fallback: take first sentence, cap at 120 chars
  const clean = msg.replace(/\{[\s\S]*\}/g, "").replace(/\([\s\S]*\)/g, "").trim();
  const first = clean.split(/[.!]/)[0]?.trim();
  return first?.length > 10 ? first.slice(0, 120) : "Transaction failed. Please try again.";
}

export function useEscrow() {
  const [address, setAddress] = useState<string | null>(null);
  const [escrows, setEscrows] = useState<EscrowJob[]>([]);
  const [freelancerEscrows, setFreelancerEscrows] = useState<EscrowJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = async (withSigner = false) => {
    if (!window.ethereum) throw new Error("Wallet not found. Please install Rabby or MetaMask.");
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
    }
    return new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider);
  };

  const switchToRSK = async () => {
    if (!window.ethereum) throw new Error("Wallet not found");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: RSK_TESTNET.chainId }],
      });
    } catch (err: any) {
      // Some wallets (Rabby) nest the error code inside data.originalError
      // or wrap it as -32603 with 4902 inside
      const code = err?.data?.originalError?.code ?? err.code;
      if (code === 4902 || err.code === -32603) {
        await window.ethereum!.request({
          method: "wallet_addEthereumChain",
          params: [RSK_TESTNET],
        });
      } else throw err;
    }
  };

  const connect = useCallback(async () => {
    try {
      setError(null);
      if (!window.ethereum) throw new Error("Wallet not found. Please install a compatible wallet (Rabby, MetaMask).");

      // Request accounts first
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      if (!accounts || accounts.length === 0) throw new Error("No accounts found");

      // Try adding the RSK Testnet chain first (idempotent — no-ops if already added)
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [RSK_TESTNET],
        });
      } catch {
        // Some wallets don't support addEthereumChain, fall through to switch
      }

      // Then switch to it
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: RSK_TESTNET.chainId }],
      });

      setAddress(accounts[0]);
      return accounts[0];
    } catch (err: any) {
      console.error("Connection error:", err);
      setError(parseError(err));
      return null;
    }
  }, []);

  const normalizeEscrow = (e: any): EscrowJob => ({
    id: BigInt(e.id),
    client: String(e.client),
    freelancer: String(e.freelancer),
    amount: BigInt(e.amount),
    status: Number(e.status),
    createdAt: BigInt(e.createdAt),
  });

  const fetchEscrows = useCallback(async (userAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getContract();
      const addr = userAddress.toLowerCase();

      // Fetch escrows where user is the client
      const clientResult = await contract.getEscrowsByClient(userAddress);
      const clientEscrows = Array.from(clientResult).map(normalizeEscrow);
      setEscrows(clientEscrows);

      // Fetch all escrows and filter for freelancer role
      const count = await contract.escrowCount();
      const total = Number(count);
      const freelancerResults: EscrowJob[] = [];
      for (let i = 0; i < total; i++) {
        try {
          const e = await contract.escrows(i);
          if (String(e[2]).toLowerCase() === addr) {
            freelancerResults.push(normalizeEscrow({
              id: e[0], client: e[1], freelancer: e[2],
              amount: e[3], status: e[4], createdAt: e[5],
            }));
          }
        } catch {
          // Skip unreadable escrows
        }
      }
      setFreelancerEscrows(freelancerResults);
    } catch (err: any) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Returns { submitted, wait } — submitted resolves once wallet signs (fast),
  // wait() returns a promise that resolves when the tx is mined (slow).
  const createEscrow = useCallback(async (freelancer: string, amountRBTC: string): Promise<{ submitted: boolean; wait: () => Promise<boolean> }> => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getContract(true);
      const tx = await contract.createEscrow(freelancer, {
        value: ethers.parseEther(amountRBTC),
      });
      setLoading(false);
      return {
        submitted: true,
        wait: async () => { await tx.wait(); return true; },
      };
    } catch (err: any) {
      setError(parseError(err));
      setLoading(false);
      return { submitted: false, wait: async () => false };
    }
  }, []);

  const release = useCallback(async (id: bigint): Promise<{ submitted: boolean; wait: () => Promise<boolean> }> => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getContract(true);
      const tx = await contract.release(id);
      setLoading(false);
      return {
        submitted: true,
        wait: async () => { await tx.wait(); return true; },
      };
    } catch (err: any) {
      setError(parseError(err));
      setLoading(false);
      return { submitted: false, wait: async () => false };
    }
  }, []);

  const refund = useCallback(async (id: bigint): Promise<{ submitted: boolean; wait: () => Promise<boolean> }> => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getContract(true);
      const tx = await contract.refund(id);
      setLoading(false);
      return {
        submitted: true,
        wait: async () => { await tx.wait(); return true; },
      };
    } catch (err: any) {
      setError(parseError(err));
      setLoading(false);
      return { submitted: false, wait: async () => false };
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setEscrows([]);
    setFreelancerEscrows([]);
    setError(null);
  }, []);

  // Auto-reconnect if wallet was previously approved (no popup)
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: unknown) => {
        const accs = accounts as string[];
        if (accs?.length > 0) setAddress(accs[0]);
      })
      .catch(() => {});
  }, []);

  // Listen for account/chain changes from the wallet
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        disconnect();
      } else {
        setAddress(accs[0]);
      }
    };
    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [disconnect]);

  return { address, escrows, freelancerEscrows, loading, error, connect, disconnect, fetchEscrows, createEscrow, release, refund };
}
