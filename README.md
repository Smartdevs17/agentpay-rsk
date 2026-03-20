# AgentPay RSK — Freelance Escrow on Rootstock

A minimal trustless escrow dApp on the Rootstock blockchain. Lock RBTC for a freelancer, release when work is done — or refund if it isn't.

## Live on Rootstock Testnet
> Contract: `[paste address after deploy]`
> Explorer: https://explorer.testnet.rootstock.io

---

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/agentpay-rsk
cd agentpay-rsk
npm install
cd frontend && npm install
```

### 2. Environment
```bash
cp .env.example .env
# Fill in your PRIVATE_KEY (testnet wallet only)
```

### 3. Get Testnet RBTC
Visit https://faucet.rootstock.io and request tRBTC to your deployer address.

### 4. Compile & Deploy Contract
```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network rskTestnet
```
Copy the deployed address into `.env` as `NEXT_PUBLIC_CONTRACT_ADDRESS`.

### 5. Run Frontend
```bash
cd frontend
npm run dev
```
Open http://localhost:3000

---

## How It Works
1. Client connects MetaMask (auto-switches to RSK Testnet)
2. Client enters freelancer address + RBTC amount → clicks **Lock Funds**
3. Funds are held in the contract
4. Client reviews work off-chain
5. Client clicks **Release** → RBTC sent to freelancer
6. OR client clicks **Refund** → RBTC returned to client

---

## Stack
- Solidity + Hardhat (contracts)
- Next.js 14 + TypeScript + Tailwind CSS (frontend)
- Ethers.js v6 (wallet + contract interaction)
- Rootstock Testnet (chainId: 31)
