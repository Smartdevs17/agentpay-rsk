// Off-chain scope metadata stored in localStorage (contract doesn't store this)
// Keyed by escrow ID

export type ScopeData = {
  scope: string;
  githubUrl: string;
  verificationStatus?: "pending" | "pass" | "fail";
  verificationResult?: string;
  verifiedAt?: string;
};

const STORAGE_KEY = "agentpay_escrow_scopes";

function getAll(): Record<string, ScopeData> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, ScopeData>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveScope(escrowId: string, scope: string, githubUrl: string) {
  const all = getAll();
  all[escrowId] = { ...all[escrowId], scope, githubUrl };
  saveAll(all);
}

export function getScope(escrowId: string): ScopeData | null {
  return getAll()[escrowId] || null;
}

export function saveVerification(escrowId: string, status: "pass" | "fail", result: string) {
  const all = getAll();
  if (all[escrowId]) {
    all[escrowId].verificationStatus = status;
    all[escrowId].verificationResult = result;
    all[escrowId].verifiedAt = new Date().toISOString();
    saveAll(all);
  }
}

export function getAllScopes(): Record<string, ScopeData> {
  return getAll();
}
