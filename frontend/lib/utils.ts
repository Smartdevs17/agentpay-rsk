import { ethers } from "ethers";

export const shortenAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const formatRBTC = (wei: bigint): string =>
  parseFloat(ethers.formatEther(wei)).toFixed(6);

export const statusLabel = (status: number): string =>
  ["Funded", "Released", "Refunded"][status] ?? "Unknown";

export const statusColor = (status: number): string =>
  ["text-rsk-yellow", "text-rsk-green", "text-rsk-red"][status] ?? "text-rsk-gray";
