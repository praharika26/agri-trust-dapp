import { sepolia, localhost } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

// Contract addresses (update after deployment)
export const CONTRACTS = {
  AGRITRUST: {
    address: (process.env.NEXT_PUBLIC_AGRITRUST_CONTRACT || '') as `0x${string}`,
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111')
  },
  TOKEN: {
    address: (process.env.NEXT_PUBLIC_AGRITRUST_TOKEN_CONTRACT || '') as `0x${string}`,
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111')
  },
  ESCROW: {
    address: (process.env.NEXT_PUBLIC_AGRITRUST_ESCROW_CONTRACT || '') as `0x${string}`,
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111')
  }
}

// Supported chains
export const SUPPORTED_CHAINS = [sepolia, localhost]
export const DEFAULT_CHAIN = sepolia

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [sepolia, localhost],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    }),
  ],
  transports: {
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