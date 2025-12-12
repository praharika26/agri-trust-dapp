import { sepolia, localhost } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

// Define Ganache local chain
export const ganache = {
  id: 1337,
  name: 'Ganache',
  network: 'ganache',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:7545'] },
    default: { http: ['http://127.0.0.1:7545'] },
  },
  blockExplorers: {
    default: { name: 'Ganache', url: 'http://127.0.0.1:7545' },
  },
} as const

// Get current chain ID from environment
const CURRENT_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337')

// Contract addresses (update after deployment)
export const CONTRACTS = {
  AGRITRUST: {
    address: (process.env.NEXT_PUBLIC_AGRITRUST_CONTRACT || '') as `0x${string}`,
    chainId: CURRENT_CHAIN_ID
  },
  TOKEN: {
    address: (process.env.NEXT_PUBLIC_AGRITRUST_TOKEN_CONTRACT || '') as `0x${string}`,
    chainId: CURRENT_CHAIN_ID
  },
  ESCROW: {
    address: (process.env.NEXT_PUBLIC_AGRITRUST_ESCROW_CONTRACT || '') as `0x${string}`,
    chainId: CURRENT_CHAIN_ID
  },
  NFT: {
    address: (process.env.NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT || '') as `0x${string}`,
    chainId: CURRENT_CHAIN_ID
  }
}

// Supported chains - prioritize based on environment
export const SUPPORTED_CHAINS = CURRENT_CHAIN_ID === 1337 
  ? [ganache, localhost, sepolia] 
  : [sepolia, ganache, localhost]

export const DEFAULT_CHAIN = CURRENT_CHAIN_ID === 1337 ? ganache : sepolia

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [ganache, sepolia, localhost],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    }),
  ],
  transports: {
    [ganache.id]: http('http://127.0.0.1:7545'),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [localhost.id]: http(),
  },
})

// Contract ABIs (import from generated files after compilation)
export const AGRITRUST_ABI = [
  // Main contract functions
  {
    "inputs": [
      {"name": "_title", "type": "string"},
      {"name": "_description", "type": "string"},
      {"name": "_cropType", "type": "string"},
      {"name": "_quantity", "type": "uint256"},
      {"name": "_unit", "type": "string"},
      {"name": "_minimumPrice", "type": "uint256"},
      {"name": "_buyoutPrice", "type": "uint256"},
      {"name": "_ipfsHash", "type": "string"},
      {"name": "_isOrganic", "type": "bool"}
    ],
    "name": "registerCrop",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_cropId", "type": "uint256"},
      {"name": "_startingPrice", "type": "uint256"},
      {"name": "_reservePrice", "type": "uint256"},
      {"name": "_bidIncrement", "type": "uint256"},
      {"name": "_duration", "type": "uint256"}
    ],
    "name": "createAuction",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_auctionId", "type": "uint256"}],
    "name": "placeBid",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_cropId", "type": "uint256"}],
    "name": "getCrop",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "farmer", "type": "address"},
          {"name": "title", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "cropType", "type": "string"},
          {"name": "quantity", "type": "uint256"},
          {"name": "unit", "type": "string"},
          {"name": "minimumPrice", "type": "uint256"},
          {"name": "buyoutPrice", "type": "uint256"},
          {"name": "ipfsHash", "type": "string"},
          {"name": "isActive", "type": "bool"},
          {"name": "isOrganic", "type": "bool"},
          {"name": "createdAt", "type": "uint256"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_farmer", "type": "address"}],
    "name": "getFarmerCrops",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "cropId", "type": "uint256"},
      {"indexed": true, "name": "farmer", "type": "address"},
      {"indexed": false, "name": "title", "type": "string"}
    ],
    "name": "CropRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "auctionId", "type": "uint256"},
      {"indexed": true, "name": "bidder", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "BidPlaced",
    "type": "event"
  }
] as const

export const TOKEN_ABI = [
  // ERC20 standard functions
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Custom functions
  {
    "inputs": [{"name": "_user", "type": "address"}],
    "name": "getUserRewards",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const ESCROW_ABI = [
  {
    "inputs": [
      {"name": "_farmer", "type": "address"},
      {"name": "_cropId", "type": "uint256"},
      {"name": "_quantity", "type": "uint256"},
      {"name": "_deliveryDays", "type": "uint256"}
    ],
    "name": "createEscrow",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_transactionId", "type": "uint256"}],
    "name": "getTransaction",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "buyer", "type": "address"},
          {"name": "farmer", "type": "address"},
          {"name": "cropId", "type": "uint256"},
          {"name": "amount", "type": "uint256"},
          {"name": "quantity", "type": "uint256"},
          {"name": "status", "type": "uint8"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "deliveryDeadline", "type": "uint256"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const NFT_ABI = [
  // View functions
  "function getCurrentTokenId() external view returns (uint256)",
  "function getCropCertificate(uint256 tokenId) external view returns (tuple(uint256 tokenId, address farmer, string title, string description, string cropType, string variety, uint256 quantity, string unit, string location, bool isOrganic, string qualityGrade, uint256 harvestDate, uint256 minimumPrice, uint256 buyoutPrice, string ipfsMetadata, uint256 createdAt, bool isActive, bool isSold))",
  "function getActiveCrops() external view returns (uint256[])",
  "function getFarmerCrops(address farmer) external view returns (uint256[])",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function isFarmerVerified(address farmer) external view returns (bool)",
  
  // Write functions
  "function createCropCertificate(string memory title, string memory description, string memory cropType, string memory variety, uint256 quantity, string memory unit, string memory location, bool isOrganic, string memory qualityGrade, uint256 harvestDate, uint256 minimumPrice, uint256 buyoutPrice, string memory ipfsMetadata) external returns (uint256)",
  "function createAuction(uint256 tokenId, uint256 startingPrice, uint256 reservePrice, uint256 bidIncrement, uint256 duration) external returns (uint256)",
  "function placeBid(uint256 auctionId) external payable",
  "function finalizeAuction(uint256 auctionId) external",
  "function directPurchase(uint256 tokenId) external payable",
  
  // Events
  "event CropCertificateCreated(uint256 indexed tokenId, address indexed farmer, string title)",
  "event AuctionCreated(uint256 indexed auctionId, uint256 indexed tokenId, uint256 startingPrice)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event CropSold(uint256 indexed tokenId, address indexed buyer, uint256 amount)"
] as const