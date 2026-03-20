import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    rskTestnet: {
      url: process.env.RSK_TESTNET_RPC || "https://public-node.testnet.rsk.co",
      chainId: 31,
      accounts: [PRIVATE_KEY],
    },
    rskMainnet: {
      url: process.env.RSK_MAINNET_RPC || "https://public-node.rsk.co",
      chainId: 30,
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;
