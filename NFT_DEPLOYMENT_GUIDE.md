# AgriTrust NFT Deployment Guide

This guide provides step-by-step instructions for deploying AgriTrust smart contracts with NFT-based crop verification using Remix IDE.

## Prerequisites

1. **MetaMask Wallet**: Install and set up MetaMask browser extension
2. **Sepolia ETH**: Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. **Remix IDE**: Access at [remix.ethereum.org](https://remix.ethereum.org)

## Contract Deployment Order

Deploy contracts in this specific order due to dependencies:

### 1. AgriTrustNFT Contract (Primary)

**File**: `contracts/AgriTrustNFT.sol`

**Steps**:
1. Open Remix IDE
2. Create new file: `AgriTrustNFT.sol`
3. Copy contract code from `contracts/AgriTrustNFT.sol`
4. Install OpenZeppelin contracts:
   - Go to "File Explorer" tab
   - Click "Install" button
   - Search for "@openzeppelin/contracts"
   - Install version 4.9.0 or later
5. Go to "Solidity Compiler" tab
6. Select compiler version: `0.8.19`
7. Click "Compile AgriTrustNFT.sol"
8. Go to "Deploy & Run Transactions" tab
9. Select Environment: "Injected Provider - MetaMask"
10. Select Account: Your MetaMask account
11. Select Contract: "AgriTrustNFT"
12. Click "Deploy"
13. Confirm transaction in MetaMask
14. **Copy the deployed contract address**

### 2. Update Environment Variables

After deployment, update your `.env.local` file:

```env
# Contract Addresses (update after deployment)
NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT=0x_YOUR_NFT_CONTRACT_ADDRESS
NEXT_PUBLIC_CHAIN_ID=11155111
```

## Verification on Etherscan

1. Go to [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Search for your contract address
3. Go to "Contract" tab
4. Click "Verify and Publish"
5. Select:
   - Compiler Type: Solidity (Standard JSON Input)
   - Compiler Version: v0.8.19
   - License: MIT
6. Upload the flattened contract or use the standard JSON input
7. Click "Verify and Publish"

## Testing the Deployment

1. **Update Frontend**: Ensure contract address is in `.env.local`
2. **Restart Development Server**: `npm run dev`
3. **Connect Wallet**: Use MetaMask on Sepolia network
4. **Test NFT Functions**:
   - Register a crop (creates NFT)
   - View NFT metadata
   - Create auctions for NFTs
   - Place bids and complete purchases
   - Transfer NFT ownership

## Contract Functions

### AgriTrustNFT (Primary Contract)

**Crop Management**:
- `createCropCertificate()`: Mint NFT crop certificate
- `getCropCertificate()`: Get crop details
- `getFarmerCrops()`: Get farmer's NFTs
- `getActiveCrops()`: Get all active crop NFTs

**Auction System**:
- `createAuction()`: Start auction for NFT
- `placeBid()`: Place bid on auction
- `finalizeAuction()`: Complete auction
- `getAuction()`: Get auction details

**Direct Sales**:
- `directPurchase()`: Buy NFT directly
- `ownerOf()`: Get NFT owner
- `tokenURI()`: Get NFT metadata

**Verification**:
- `verifyFarmer()`: Verify farmer (owner only)
- `isFarmerVerified()`: Check farmer status

## Gas Estimates

### AgriTrustNFT Contract
- Deploy Contract: ~3,500,000 gas
- Create Crop Certificate: ~250,000 gas
- Create Auction: ~150,000 gas
- Place Bid: ~100,000 gas
- Finalize Auction: ~180,000 gas
- Direct Purchase: ~120,000 gas

## NFT Features

### Crop Certificate NFT
- **ERC-721 Standard**: Full NFT compatibility
- **IPFS Metadata**: Decentralized metadata storage
- **Authenticity Proof**: Blockchain-verified crop data
- **Ownership Transfer**: Automatic on sale completion
- **Farmer Verification**: Admin-controlled verification system

### Metadata Structure
```json
{
  "name": "Premium Organic Wheat",
  "description": "High-quality organic wheat...",
  "image": "https://gateway.pinata.cloud/ipfs/...",
  "external_url": "https://agritrust.app/crop/0x...",
  "attributes": [
    {"trait_type": "Crop Type", "value": "wheat"},
    {"trait_type": "Quantity", "value": 1000, "display_type": "number"},
    {"trait_type": "Unit", "value": "kg"},
    {"trait_type": "Organic Certified", "value": true},
    {"trait_type": "Quality Grade", "value": "A"},
    {"trait_type": "Location", "value": "Punjab, India"}
  ],
  "verification": {
    "farmer_address": "0x...",
    "farmer_verified": true,
    "registration_date": "2024-12-12T...",
    "blockchain_tx": "0x..."
  },
  "crop_details": {
    "type": "wheat",
    "variety": "Hard Red Winter",
    "quantity": 1000,
    "unit": "kg",
    "harvest_date": "2024-10-15",
    "location": "Punjab, India"
  },
  "quality": {
    "grade": "A",
    "organic_certified": true,
    "moisture_content": 12.5,
    "storage_conditions": "Cool, dry warehouse"
  }
}
```

## Frontend Integration

The AgriTrust frontend automatically integrates with NFT contracts:

### Registration Flow
1. **Form Submission**: User fills crop registration form
2. **IPFS Upload**: Metadata uploaded to IPFS via Pinata
3. **NFT Minting**: `createCropCertificate()` called with IPFS URL
4. **Database Storage**: Crop saved with NFT token ID and transaction hash
5. **Verification Badge**: NFT verification badge displayed in marketplace

### Marketplace Display
- **NFT Badges**: Blue "NFT Verified" badges on crop cards
- **Token IDs**: Display NFT token numbers (e.g., "NFT #123")
- **Blockchain Links**: Links to view NFT on OpenSea testnet
- **Metadata Access**: Direct links to IPFS metadata

### Auction Integration
- **NFT Ownership**: Only NFT owner can create auctions
- **Automatic Transfer**: NFT transfers to winner on auction completion
- **Ownership Verification**: Real-time ownership checks

## Troubleshooting

### Common Issues

1. **Out of Gas**: Increase gas limit in MetaMask (use 3,000,000+ for deployment)
2. **Transaction Failed**: Check Sepolia ETH balance
3. **Contract Not Found**: Verify contract address in `.env.local`
4. **Network Issues**: Ensure MetaMask is on Sepolia network
5. **OpenZeppelin Import Error**: Ensure contracts are properly installed in Remix

### NFT-Specific Issues

1. **Metadata Not Loading**: Check IPFS URL accessibility
2. **NFT Not Minting**: Verify all required parameters are provided
3. **Auction Creation Failed**: Ensure NFT ownership and approval
4. **Transfer Failed**: Check NFT ownership and approval status

### Support Resources

- Check transaction status on [Sepolia Etherscan](https://sepolia.etherscan.io/)
- Verify contract deployment was successful
- Test NFT functions on [OpenSea Testnet](https://testnets.opensea.io/)
- View NFT metadata on IPFS gateways

## Security Notes

- This is for testnet deployment only
- Never use mainnet for testing
- Keep private keys secure
- Verify all contract addresses before use
- NFT metadata on IPFS is immutable once pinned
- Platform fees are collected by contract owner

## Benefits of NFT Integration

### For Farmers
- **Authenticity Proof**: Blockchain-verified crop certificates
- **Ownership Rights**: True ownership of crop data
- **Transferable Assets**: NFTs can be traded independently
- **Verification Status**: Admin-verified farmer badges

### For Buyers
- **Trust & Transparency**: Immutable crop history
- **Authenticity Guarantee**: Blockchain-verified provenance
- **Quality Assurance**: Permanent quality records
- **Resale Value**: NFTs retain value after purchase

### For Platform
- **Differentiation**: Unique NFT-based verification
- **Revenue Streams**: Platform fees on all transactions
- **Data Integrity**: Immutable crop records
- **Marketplace Value**: Enhanced trust and transparency

## Next Steps

After successful deployment:

1. **Test Core Functions**:
   - Register crops and mint NFTs
   - Create and participate in auctions
   - Complete direct purchases
   - Verify NFT transfers

2. **Verify Integration**:
   - Check NFT display in marketplace
   - Test metadata loading from IPFS
   - Verify OpenSea testnet compatibility
   - Confirm ownership transfers

3. **Production Preparation**:
   - Document all contract addresses
   - Prepare mainnet deployment plan
   - Set up monitoring and analytics
   - Plan farmer verification process

## Contract Interaction Examples

### Create Crop Certificate NFT
```javascript
await nftContract.createCropCertificate(
  "Premium Organic Wheat",           // title
  "High-quality organic wheat...",   // description
  "wheat",                          // crop type
  "Hard Red Winter",                // variety
  ethers.parseUnits("1000", 0),     // quantity
  "kg",                             // unit
  "Punjab, India",                  // location
  true,                             // organic certified
  "A",                              // quality grade
  1697328000,                       // harvest date (timestamp)
  ethers.parseEther("0.05"),        // minimum price
  ethers.parseEther("0.08"),        // buyout price
  "https://gateway.pinata.cloud/ipfs/..." // IPFS metadata URL
)
```

### Create Auction for NFT
```javascript
await nftContract.createAuction(
  123,                              // token ID
  ethers.parseEther("0.05"),        // starting price
  ethers.parseEther("0.04"),        // reserve price
  ethers.parseEther("0.01"),        // bid increment
  86400                             // duration (24 hours)
)
```

### Direct Purchase NFT
```javascript
await nftContract.directPurchase(123, {
  value: ethers.parseEther("0.08")  // buyout price
})
```

This gives you a **fully functional NFT-based agricultural marketplace** with blockchain-verified crop authenticity!