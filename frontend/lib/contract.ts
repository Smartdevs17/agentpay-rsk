// Update ESCROW_CONTRACT_ADDRESS after running: npx hardhat run scripts/deploy.ts --network rskTestnet
export const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x593e4Ca205d04F1FA4D7Db94C5690747d18b8DA1";

export const RSK_TESTNET = {
  chainId: "0x1f", // 31 in hex
  chainName: "Rootstock Testnet",
  nativeCurrency: { name: "tRBTC", symbol: "tRBTC", decimals: 18 },
  rpcUrls: ["https://public-node.testnet.rsk.co"],
  blockExplorerUrls: ["https://explorer.testnet.rootstock.io"],
};

export const ESCROW_ABI = [
  "function createEscrow(address freelancer) payable returns (uint256)",
  "function release(uint256 id)",
  "function refund(uint256 id)",
  "function getEscrowsByClient(address client) view returns (tuple(uint256 id, address client, address freelancer, uint256 amount, uint8 status, uint256 createdAt)[])",
  "function escrows(uint256 id) view returns (uint256 id, address client, address freelancer, uint256 amount, uint8 status, uint256 createdAt)",
  "function escrowCount() view returns (uint256)",
  "event EscrowCreated(uint256 indexed id, address indexed client, address indexed freelancer, uint256 amount)",
  "event EscrowReleased(uint256 indexed id, address indexed freelancer, uint256 amount)",
  "event EscrowRefunded(uint256 indexed id, address indexed client, uint256 amount)",
];
