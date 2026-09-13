// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SignatureVerifier
 * @dev Verifies Ethereum signatures to prove ownership of addresses
 */
contract SignatureVerifier {
    // Event emitted when a signature is successfully verified
    event SignatureVerified(
        address indexed signer,
        address indexed claimedAddress,
        string message,
        uint256 timestamp
    );

    // Store verified ownership claims
    mapping(address => mapping(address => bool)) public verifiedClaims;
    mapping(address => uint256) public verificationCount;

    /**
     * @dev Verifies that a signature was created by a specific address for a message
     * @param message The original message that was signed
     * @param signature The signature (v, r, s encoded)
     * @param signer The address that should have signed the message
     * @return bool True if signature is valid, false otherwise
     */
    function verifySignature(
        string memory message,
        bytes memory signature,
        address signer
    ) public pure returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(message));
        address recoveredSigner = recoverSigner(messageHash, signature);
        return recoveredSigner == signer;
    }

    /**
     * @dev Recovers the signer address from a message hash and signature
     * @param messageHash The hash of the message
     * @param signature The signature (v, r, s encoded)
     * @return address The recovered signer address
     */
    function recoverSigner(
        bytes32 messageHash,
        bytes memory signature
    ) public pure returns (address) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Invalid signature 'v' value");

        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        address signer = ecrecover(ethSignedMessageHash, v, r, s);
        require(signer != address(0), "Invalid signature");

        return signer;
    }

    /**
     * @dev Verifies ownership claim and stores it on-chain
     * @param claimedAddress The address being claimed as owned
     * @param message The verification message
     * @param signature The signature proving ownership
     * @return bool True if verification succeeds
     */
    function verifyOwnership(
        address claimedAddress,
        string memory message,
        bytes memory signature
    ) public returns (bool) {
        require(claimedAddress != address(0), "Invalid claimed address");
        require(signature.length == 65, "Invalid signature length");

        // Verify the signature
        bool isValid = verifySignature(message, signature, claimedAddress);
        require(isValid, "Invalid signature for claimed address");

        // Store the verified claim
        verifiedClaims[msg.sender][claimedAddress] = true;
        verificationCount[msg.sender]++;

        emit SignatureVerified(
            msg.sender,
            claimedAddress,
            message,
            block.timestamp
        );

        return true;
    }

    /**
     * @dev Checks if an address has verified ownership of another address
     * @param verifier The address that performed the verification
     * @param claimedAddress The address that was verified
     * @return bool True if ownership has been verified
     */
    function isVerified(
        address verifier,
        address claimedAddress
    ) public view returns (bool) {
        return verifiedClaims[verifier][claimedAddress];
    }

    /**
     * @dev Gets the number of verifications performed by an address
     * @param verifier The address to check
     * @return uint256 Number of verifications
     */
    function getVerificationCount(address verifier)
        public
        view
        returns (uint256)
    {
        return verificationCount[verifier];
    }
}