const hre = require("hardhat");

async function main() {
  console.log("Deploying SignatureVerifier contract...");

  const SignatureVerifier = await hre.ethers.getContractFactory(
    "SignatureVerifier"
  );
  const signatureVerifier = await SignatureVerifier.deploy();

  await signatureVerifier.waitForDeployment();

  const contractAddress = await signatureVerifier.getAddress();
  console.log("SignatureVerifier deployed to:", contractAddress);

  // Print network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });