import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AgentPay RSK Escrow contract to Rootstock...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "RBTC");

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log("✅ Escrow deployed to:", address);
  console.log("👉 Copy this address into frontend/lib/contract.ts as ESCROW_CONTRACT_ADDRESS");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
