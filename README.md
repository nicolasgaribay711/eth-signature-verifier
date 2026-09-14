## Ethereum Signature Verifier

A smart contract for verifying Ethereum signatures and proving ownership of addresses on-chain.

### Features

- ✅ **Signature Verification** - Verify that a signature was created by a specific address
- ✅ **Signer Recovery** - Recover the signer address from a message and signature
- ✅ **Ownership Claims** - Store and verify ownership claims on-chain
- ✅ **Event Logging** - Emit events for all successful verifications
- ✅ **Gas Optimized** - Efficient implementation using assembly

### How It Works

The contract uses ECDSA (Elliptic Curve Digital Signature Algorithm) to:

1. **Sign a message** - A user signs a message using their private key
2. **Recover the signer** - The contract uses `ecrecover` to recover the signer address from the signature
3. **Verify ownership** - If the recovered address matches the claimed address, ownership is verified

### Smart Contract

**SignatureVerifier.sol** - Main contract with the following functions:

- `verifySignature(message, signature, signer)` - Verify a signature
- `recoverSigner(messageHash, signature)` - Recover signer address
- `verifyOwnership(claimedAddress, message, signature)` - Verify and store ownership
- `isVerified(verifier, claimedAddress)` - Check if ownership is verified
- `getVerificationCount(verifier)` - Get number of verifications

### Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test
```

### Deployment

#### Local Network (Hardhat)

```bash
# Start Hardhat node
npx hardhat node

# Deploy to localhost
npm run deploy:localhost
```

#### Testnet (Sepolia)

1. Set up environment variables in `.env`:

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

2. Deploy:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Usage Example

```javascript
const message = "I, hereby verify that I am the owner/creator of the address [0x91211A4965e75152Cb549b308f8ba398c3aB337e]";

    //  Nicolas Sign the message
const signature = await signer.signMessage(ethers.getBytes(messageHash));

// Verify ownership on-chain
await signatureVerifier.verifyOwnership(claimedAddress, message, signature);

// Check if verified
const isVerified = await signatureVerifier.isVerified(verifier, claimedAddress);
```

### Testing

The test suite includes:

- ✅ Signature verification tests
- ✅ Invalid signature rejection
- ✅ Signer recovery tests
- ✅ Ownership verification tests
- ✅ Event emission tests
- ✅ Verification count tracking

Run tests:

```bash
npm run test
```

### Security Considerations

- **Signature Validation** - Uses standard EIP-191 Ethereum signed messages
- **ECDSA Recovery** - Implements secure ecrecover with proper validation
- **No Centralization** - Contract does not require owner/admin privileges
- **Immutable Verification** - Once verified, claims are permanently stored

### Gas Optimization

- Assembly-level signature unpacking
- Optimized compiler settings (200 runs)
- Efficient storage patterns

### Network Support

- Hardhat (Local)
- Localhost
- Sepolia Testnet
- Ethereum Mainnet (with configuration)

### License

MIT

### Author

nicolasgaribay711