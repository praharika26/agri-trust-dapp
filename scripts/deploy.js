const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting AgriTrust contract deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy AgriTrustToken first
  console.log("\n📄 Deploying AgriTrustToken...");
  const AgriTrustToken = await hre.ethers.getContractFactory("AgriTrustToken");
  const token = await AgriTrustToken.deploy();
  await token.deployed();
  console.log("✅ AgriTrustToken deployed to:", token.address);

  // Deploy AgriTrust main contract
  console.log("\n📄 Deploying AgriTrust main contract...");
  const AgriTrust = await hre.ethers.getContractFactory("AgriTrust");
  const agriTrust = await AgriTrust.deploy();
  await agriTrust.deployed();
  console.log("✅ AgriTrust deployed to:", agriTrust.address);

  // Deploy AgriTrustEscrow
  console.log("\n📄 Deploying AgriTrustEscrow...");
  const AgriTrustEscrow = await hre.ethers.getContractFactory("AgriTrustEscrow");
  const escrow = await AgriTrustEscrow.deploy();
  await escrow.deployed();
  console.log("✅ AgriTrustEscrow deployed to:", escrow.address);

  // Configure contracts
  console.log("\n⚙️  Configuring contracts...");
  
  // Set up token contract with main contract address
  const setAgriTrustTx = await token.setAgriTrustContract(agriTrust.address);
  await setAgriTrustTx.wait();
  console.log("✅ Token contract configured with AgriTrust address");

  // Verify contracts on Etherscan (if not localhost)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n🔍 Waiting for block confirmations...");
    await token.deployTransaction.wait(6);
    await agriTrust.deployTransaction.wait(6);
    await escrow.deployTransaction.wait(6);

    console.log("\n🔍 Verifying contracts on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: token.address,
        constructorArguments: [],
      });
      console.log("✅ AgriTrustToken verified");
    } catch (error) {
      console.log("❌ Token verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: agriTrust.address,
        constructorArguments: [],
      });
      console.log("✅ AgriTrust verified");
    } catch (error) {
      console.log("❌ AgriTrust verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: escrow.address,
        constructorArguments: [],
      });
      console.log("✅ AgriTrustEscrow verified");
    } catch (error) {
      console.log("❌ Escrow verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      AgriTrustToken: {
        address: token.address,
        transactionHash: token.deployTransaction.hash
      },
      AgriTrust: {
        address: agriTrust.address,
        transactionHash: agriTrust.deployTransaction.hash
      },
      AgriTrustEscrow: {
        address: escrow.address,
        transactionHash: escrow.deployTransaction.hash
      }
    },
    deployedAt: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("Deployer:", deployer.address);
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("AgriTrustToken:  ", token.address);
  console.log("AgriTrust:       ", agriTrust.address);
  console.log("AgriTrustEscrow: ", escrow.address);
  console.log("");
  console.log("📁 Deployment info saved to:", deploymentFile);
  console.log("");
  console.log("🔧 Next steps:");
  console.log("1. Update your .env.local with these contract addresses:");
  console.log(`   NEXT_PUBLIC_AGRITRUST_CONTRACT=${agriTrust.address}`);
  console.log(`   NEXT_PUBLIC_AGRITRUST_TOKEN_CONTRACT=${token.address}`);
  console.log(`   NEXT_PUBLIC_AGRITRUST_ESCROW_CONTRACT=${escrow.address}`);
  console.log("2. Test the contracts with your frontend");
  console.log("3. Fund the token contract for rewards");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });