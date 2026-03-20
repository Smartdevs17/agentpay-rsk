# AgentPay RSK — Freelance Escrow on Rootstock

## Project Overview
AgentPay RSK is a minimal escrow dApp on the Rootstock blockchain. A client locks RBTC into a smart contract and releases it to a freelancer once satisfied with delivered work — or reclaims it via refund. No middlemen. Permissionless. Bitcoin-secured.

## Tech Stack
- **Smart Contracts**: Solidity, Hardhat
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Ethers.js v6
- **Network**: Rootstock Testnet (chainId: 31) + Rootstock Mainnet (chainId: 30)
- **Deployment**: Replit

## Rootstock Network Config
```
Testnet RPC:   https://public-node.testnet.rsk.co
Mainnet RPC:   https://public-node.rsk.co
Chain ID:      31 (testnet) / 30 (mainnet)
Explorer:      https://explorer.testnet.rootstock.io (testnet)
Currency:      RBTC
Faucet:        https://faucet.rootstock.io
```

## Brand & Design System
Use Rootstock's official brand theme throughout the UI:
```
--rsk-orange:       #FF6B00   /* Primary brand color */
--rsk-orange-light: #FF8C33
--rsk-dark:         #0D0D0D   /* Background */
--rsk-dark-card:    #161616   /* Card background */
--rsk-dark-border:  #2A2A2A   /* Border color */
--rsk-white:        #FFFFFF
--rsk-gray:         #8A8A8A   /* Muted text */
--rsk-green:        #22C55E   /* Success / Released state */
--rsk-red:          #EF4444   /* Danger / Refunded state */
--rsk-yellow:       #EAB308   /* Pending / Funded state */
```
Font: Use `Space Mono` for addresses/amounts, `Sora` for UI text.
Dark theme only. Orange accents on dark backgrounds.

## Project Structure
```
agentpay-rsk/
├── CLAUDE.md                        # This file
├── contracts/
│   └── Escrow.sol                   # Core escrow smart contract
├── scripts/
│   └── deploy.ts                    # Hardhat deploy script
├── test/
│   └── Escrow.test.ts               # Contract unit tests
├── hardhat.config.ts                # Hardhat config with RSK networks
├── frontend/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with wallet provider
│   │   ├── page.tsx                 # Main single-page UI
│   │   └── globals.css              # Global styles + CSS variables
│   ├── components/
│   │   ├── Header.tsx               # Logo + wallet connect button
│   │   ├── CreateEscrow.tsx         # Form: freelancer address + RBTC amount
│   │   ├── EscrowCard.tsx           # Displays one escrow with Release/Refund
│   │   └── EscrowList.tsx           # Lists all escrows for connected wallet
│   ├── hooks/
│   │   └── useEscrow.ts             # Contract interaction hook
│   ├── lib/
│   │   ├── contract.ts              # Contract ABI + address constants
│   │   └── utils.ts                 # Format RBTC, shorten address helpers
│   └── public/
│       └── rsk-logo.svg             # Rootstock logo asset
├── .env.example                     # Required env vars
├── .replit                          # Replit run config
├── replit.nix                       # Replit nix environment
└── README.md                        # Setup + usage instructions
```

## Smart Contract: Escrow.sol
The contract must:
- Allow a client to call `createEscrow(address freelancer)` payable — stores RBTC, records client + freelancer, sets status to `Funded`
- Allow ONLY the client to call `release(uint256 escrowId)` — transfers RBTC to freelancer, sets status to `Released`
- Allow ONLY the client to call `refund(uint256 escrowId)` — returns RBTC to client, sets status to `Refunded`
- Emit events: `EscrowCreated`, `EscrowReleased`, `EscrowRefunded`
- Store escrows in a mapping: `mapping(uint256 => Escrow) public escrows`
- Track escrow count with a counter
- Escrow struct: `{ id, client, freelancer, amount, status, createdAt }`
- Status enum: `Funded | Released | Refunded`
- No admin, no fees, no upgradability — keep it minimal and trustless

## Frontend Behavior
Single page (`page.tsx`) with three sections:

1. **Header** — Rootstock logo left, "Connect Wallet" button right (orange). Show shortened address when connected.

2. **Create Escrow Panel** — Input: freelancer wallet address, RBTC amount. Button: "Lock Funds". Only enabled when wallet is connected. Shows a confirmation after creation.

3. **My Escrows Panel** — Lists all escrows where connected address is the client. Each card shows: escrow ID, freelancer address (shortened), amount in RBTC, status badge (color-coded), and action buttons (Release = green, Refund = red) — only visible when status is `Funded`.

## Wallet Connection
- Use `ethers.js v6` with `window.ethereum` directly — no wagmi, no RainbowKit
- On connect: check chainId, if not RSK Testnet (31), prompt user to switch network
- Add RSK Testnet to MetaMask programmatically if not present
- Store connected address in React state

## Key Rules for Claude
- DO NOT use wagmi, viem, RainbowKit, or Web3Modal — ethers.js v6 only
- DO NOT add unnecessary dependencies — keep package.json lean
- ALL contract interactions go through `hooks/useEscrow.ts`
- ALL addresses displayed must be shortened: `0x1234...abcd`
- RBTC amounts displayed to 6 decimal places max
- ALWAYS handle loading and error states in the UI
- ALWAYS check wallet is connected before any contract call
- Contract address goes in `lib/contract.ts` as `ESCROW_CONTRACT_ADDRESS`
- After deploy, update `ESCROW_CONTRACT_ADDRESS` and paste ABI into `lib/contract.ts`
- Use Rootstock Testnet for all development — never hardcode mainnet

## Env Variables
```
# .env (copy from .env.example)
PRIVATE_KEY=             # Deployer wallet private key (testnet only)
RSK_TESTNET_RPC=https://public-node.testnet.rsk.co
RSK_MAINNET_RPC=https://public-node.rsk.co
NEXT_PUBLIC_CONTRACT_ADDRESS=   # Filled after deploy
NEXT_PUBLIC_CHAIN_ID=31
```

## Commands
```bash
# Install deps
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to RSK Testnet
npx hardhat run scripts/deploy.ts --network rskTestnet

# Run frontend
cd frontend && npm run dev
```

## References
- Rootstock Docs: https://dev.rootstock.io
- RSK Scaffold: https://github.com/rsksmart/rsk-scaffold
- Testnet Explorer: https://explorer.testnet.rootstock.io
- Faucet: https://faucet.rootstock.io
