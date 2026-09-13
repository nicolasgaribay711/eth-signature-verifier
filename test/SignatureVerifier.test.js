const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SignatureVerifier", function () {
  let signatureVerifier;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const SignatureVerifier = await ethers.getContractFactory(
      "SignatureVerifier"
    );
    signatureVerifier = await SignatureVerifier.deploy();
    await signatureVerifier.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await signatureVerifier.getAddress()).to.not.equal(
        ethers.ZeroAddress
      );
    });
  });

  describe("Signature Verification", function () {
    it("Should verify a valid signature", async function () {
      const message = "I, hereby verify that I am the owner/creator of the address [0x91211A4965e75152Cb549b308f8ba398c3aB337e]";
      const messageHash = ethers.id(message);

      const signature = await addr1.signMessage(ethers.getBytes(messageHash));

      const isValid = await signatureVerifier.verifySignature(
        message,
        signature,
        addr1.address
      );
      expect(isValid).to.be.true;
    });

    it("Should reject an invalid signature", async function () {
      const message = "I, hereby verify that I am the owner/creator of the address [0x91211A4965e75152Cb549b308f8ba398c3aB337e]";
      const messageHash = ethers.id(message);

      const signature = await addr1.signMessage(ethers.getBytes(messageHash));

      const isValid = await signatureVerifier.verifySignature(
        message,
        signature,
        addr2.address
      );
      expect(isValid).to.be.false;
    });

    it("Should reject a signature with wrong message", async function () {
      const message = "Original message";
      const wrongMessage = "Different message";
      const messageHash = ethers.id(message);

      const signature = await addr1.signMessage(ethers.getBytes(messageHash));

      const isValid = await signatureVerifier.verifySignature(
        wrongMessage,
        signature,
        addr1.address
      );
      expect(isValid).to.be.false;
    });
  });

  describe("Signer Recovery", function () {
    it("Should recover the correct signer from signature", async function () {
      const message = "Test message";
      const messageHash = ethers.id(message);

      const signature = await addr1.signMessage(ethers.getBytes(messageHash));

      const recoveredSigner = await signatureVerifier.recoverSigner(
        messageHash,
        signature
      );
      expect(recoveredSigner).to.equal(addr1.address);
    });

    it("Should reject invalid signature length", async function () {
      const messageHash = ethers.id("Test message");
      const invalidSignature = "0x1234";

      await expect(
        signatureVerifier.recoverSigner(messageHash, invalidSignature)
      ).to.be.revertedWith("Invalid signature length");
    });
  });

  describe("Ownership Verification", function () {
    it("Should verify and store ownership claim", async function () {
      const claimedAddress = addr1.address;
      const message = `I, hereby verify that I am the owner/creator of the address [${claimedAddress}]`;
      const messageHash = ethers.id(message);

      const signature = await addr1.signMessage(ethers.getBytes(messageHash));

      const tx = await signatureVerifier.verifyOwnership(
        claimedAddress,
        message,
        signature
      );

      await expect(tx)
        .to.emit(signatureVerifier, "SignatureVerified")
        .withArgs(
          owner.address,
          claimedAddress,
          message,
          (await ethers.provider.getBlock("latest")).timestamp
        );

      const isVerified = await signatureVerifier.isVerified(
        owner.address,
        claimedAddress
      );
      expect(isVerified).to.be.true;
    });

    it("Should reject invalid ownership claim", async function () {
      const claimedAddress = addr1.address;
      const message = `I, hereby verify that I am the owner/creator of the address [${claimedAddress}]`;
      const messageHash = ethers.id(message);

      // Sign with addr2 instead of addr1
      const signature = await addr2.signMessage(ethers.getBytes(messageHash));

      await expect(
        signatureVerifier.verifyOwnership(claimedAddress, message, signature)
      ).to.be.revertedWith("Invalid signature for claimed address");
    });

    it("Should increment verification count", async function () {
      let count = await signatureVerifier.getVerificationCount(owner.address);
      expect(count).to.equal(0);

      const claimedAddress = addr1.address;
      const message = `I, hereby verify that I am the owner/creator of the address [${claimedAddress}]`;
      const messageHash = ethers.id(message);

      const signature = await addr1.signMessage(ethers.getBytes(messageHash));

      await signatureVerifier.verifyOwnership(claimedAddress, message, signature);

      count = await signatureVerifier.getVerificationCount(owner.address);
      expect(count).to.equal(1);
    });
  });
});