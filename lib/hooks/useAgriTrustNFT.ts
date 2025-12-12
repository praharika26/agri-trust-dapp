import { useState, useCallback } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'

// AgriTrustNFT contract ABI (essential functions only)
const AGRITRUST_NFT_ABI = [
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
]

export interface CropCertificate {
  tokenId: string
  farmer: string
  title: string
  description: string
  cropType: string
  variety: string
  quantity: string
  unit: string
  location: string
  isOrganic: boolean
  qualityGrade: string
  harvestDate: string
  minimumPrice: string
  buyoutPrice: string
  ipfsMetadata: string
  createdAt: string
  isActive: boolean
  isSold: boolean
}

export interface CreateCropParams {
  title: string
  description: string
  cropType: string
  variety: string
  quantity: number
  unit: string
  location: string
  isOrganic: boolean
  qualityGrade: string
  harvestDate: number // Unix timestamp
  minimumPrice: number // In wei
  buyoutPrice: number // In wei
  ipfsMetadata: string
}

export function useAgriTrustNFT() {
  const { wallets } = useWallets()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Test connection to Ganache
  const testConnection = useCallback(async () => {
    console.log('🧪 Testing Ganache connection...')
    
    const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337')
    const rpcUrl = chainId === 1337 
      ? (process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545')
      : 'http://127.0.0.1:8545'
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const network = await provider.getNetwork()
      const blockNumber = await provider.getBlockNumber()
      
      console.log('✅ Connection test successful:', {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber
      })
      
      return {
        success: true,
        chainId: network.chainId.toString(),
        blockNumber,
        rpcUrl
      }
    } catch (error: any) {
      console.error('❌ Connection test failed:', error.message)
      return {
        success: false,
        error: error.message,
        rpcUrl
      }
    }
  }, [])

  const getContract = useCallback(async () => {
    console.log('🔍 Getting NFT contract...')
    
    const contractAddress = process.env.NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT
    console.log('📍 Contract address:', contractAddress)
    
    if (!contractAddress) {
      throw new Error('AgriTrust NFT contract address not configured. Please deploy the contract first.')
    }

    const wallet = wallets[0]
    if (!wallet) {
      throw new Error('No wallet connected')
    }

    const targetChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337')
    console.log('🔗 Target chain ID:', targetChainId)
    
    // Test Ganache connection first
    if (targetChainId === 1337) {
      console.log('🧪 Testing Ganache connection...')
      try {
        const testProvider = new ethers.JsonRpcProvider('http://127.0.0.1:7545')
        const network = await testProvider.getNetwork()
        console.log('✅ Ganache connection successful:', network)
      } catch (testError: any) {
        console.error('❌ Ganache connection failed:', testError.message)
        throw new Error(`Failed to connect to Ganache network. Make sure Ganache is running on port 7545. Error: ${testError.message}`)
      }
    }
    
    try {
      console.log('🔄 Switching wallet to chain:', targetChainId)
      // Switch to the correct chain
      await wallet.switchChain(targetChainId)
      console.log('✅ Chain switch successful')
    } catch (switchError: any) {
      console.log('⚠️ Chain switch failed, attempting to add network:', switchError.message)
      // If switching fails, try to add the network (for Ganache)
      if (targetChainId === 1337) {
        try {
          console.log('➕ Adding Ganache network to wallet...')
          const ethereumProvider = await wallet.getEthereumProvider()
          await ethereumProvider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: 'Ganache Local',
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:7545'],
            }],
          })
          console.log('✅ Network added, switching again...')
          await wallet.switchChain(targetChainId)
          console.log('✅ Chain switch successful after adding network')
        } catch (addError: any) {
          console.error('❌ Failed to add/switch to Ganache network:', addError.message)
          throw new Error(`Failed to connect to Ganache network. Make sure Ganache is running on port 7545. Error: ${addError.message}`)
        }
      } else {
        throw new Error(`Failed to switch to chain ${targetChainId}: ${switchError.message}`)
      }
    }

    console.log('🔌 Getting provider and signer...')
    const ethereumProvider = await wallet.getEthereumProvider()
    
    // Create ethers provider from the EIP1193 provider
    const provider = new ethers.BrowserProvider(ethereumProvider)
    const signer = await provider.getSigner()
    
    console.log('📄 Creating contract instance...')
    const contract = new ethers.Contract(contractAddress, AGRITRUST_NFT_ABI, signer)
    console.log('✅ Contract instance created successfully')
    
    return contract
  }, [wallets])

  const getReadOnlyContract = useCallback(async () => {
    console.log('📖 Getting read-only NFT contract...')
    
    const contractAddress = process.env.NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT
    console.log('📍 Contract address:', contractAddress)
    
    if (!contractAddress) {
      throw new Error('AgriTrust NFT contract address not configured. Please deploy the contract first.')
    }

    // Use the appropriate RPC URL based on chain ID
    const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337')
    let rpcUrl: string
    
    if (chainId === 1337) {
      rpcUrl = process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545'
    } else if (chainId === 11155111) {
      rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID'
    } else {
      rpcUrl = 'http://127.0.0.1:8545' // Default localhost
    }
    
    console.log('🌐 Using RPC URL:', rpcUrl)
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      console.log('🔌 Testing provider connection...')
      
      // Test the connection
      const network = await provider.getNetwork()
      console.log('✅ Provider connection successful:', network)
      
      const contract = new ethers.Contract(contractAddress, AGRITRUST_NFT_ABI, provider)
      console.log('✅ Read-only contract instance created')
      
      return contract
    } catch (error: any) {
      console.error('❌ Failed to create read-only contract:', error.message)
      throw new Error(`Failed to connect to blockchain network at ${rpcUrl}. Error: ${error.message}`)
    }
  }, [])

  // Create crop certificate NFT
  const createCropCertificate = useCallback(async (params: CreateCropParams) => {
    console.log('🚀 Starting NFT creation process...')
    console.log('📋 Parameters:', params)
    
    setLoading(true)
    setError(null)
    
    try {
      // First test the connection
      console.log('🧪 Testing connection before contract interaction...')
      const connectionTest = await testConnection()
      if (!connectionTest.success) {
        throw new Error(`Connection test failed: ${connectionTest.error}`)
      }
      console.log('✅ Connection test passed')
      
      console.log('📄 Getting contract instance...')
      const contract = await getContract()
      
      console.log('💰 Parsing prices...')
      const minimumPriceWei = ethers.parseEther(params.minimumPrice.toString())
      const buyoutPriceWei = ethers.parseEther(params.buyoutPrice.toString())
      console.log('💰 Prices parsed:', {
        minimumPrice: params.minimumPrice,
        minimumPriceWei: minimumPriceWei.toString(),
        buyoutPrice: params.buyoutPrice,
        buyoutPriceWei: buyoutPriceWei.toString()
      })
      
      console.log('📝 Calling createCropCertificate...')
      const tx = await contract.createCropCertificate(
        params.title,
        params.description,
        params.cropType,
        params.variety,
        ethers.parseUnits(params.quantity.toString(), 0), // Convert to BigNumber
        params.unit,
        params.location,
        params.isOrganic,
        params.qualityGrade,
        params.harvestDate,
        minimumPriceWei,
        buyoutPriceWei,
        params.ipfsMetadata
      )
      
      console.log('⏳ Transaction sent, waiting for confirmation...', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ Transaction confirmed:', receipt)
      
      // Find the CropCertificateCreated event
      console.log('🔍 Looking for CropCertificateCreated event...')
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed?.name === 'CropCertificateCreated'
        } catch {
          return false
        }
      })
      
      let tokenId = null
      if (event) {
        const parsed = contract.interface.parseLog(event)
        tokenId = parsed?.args[0]?.toString()
        console.log('🎯 Found tokenId:', tokenId)
      } else {
        console.log('⚠️ CropCertificateCreated event not found in logs')
      }
      
      const result = {
        success: true,
        transactionHash: receipt.hash,
        tokenId,
        blockNumber: receipt.blockNumber
      }
      
      console.log('🎉 NFT creation successful:', result)
      return result
    } catch (err: any) {
      console.error('❌ NFT creation failed:', err)
      const errorMessage = err.reason || err.message || 'Failed to create crop certificate'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [getContract, testConnection])

  // Get crop certificate details
  const getCropCertificate = useCallback(async (tokenId: string): Promise<CropCertificate> => {
    try {
      const contract = await getReadOnlyContract()
      const result = await contract.getCropCertificate(tokenId)
      
      return {
        tokenId: result.tokenId.toString(),
        farmer: result.farmer,
        title: result.title,
        description: result.description,
        cropType: result.cropType,
        variety: result.variety,
        quantity: ethers.formatUnits(result.quantity, 0),
        unit: result.unit,
        location: result.location,
        isOrganic: result.isOrganic,
        qualityGrade: result.qualityGrade,
        harvestDate: result.harvestDate.toString(),
        minimumPrice: ethers.formatEther(result.minimumPrice),
        buyoutPrice: ethers.formatEther(result.buyoutPrice),
        ipfsMetadata: result.ipfsMetadata,
        createdAt: result.createdAt.toString(),
        isActive: result.isActive,
        isSold: result.isSold
      }
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to get crop certificate'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [getReadOnlyContract])

  // Get farmer's crops
  const getFarmerCrops = useCallback(async (farmerAddress: string): Promise<string[]> => {
    try {
      const contract = await getReadOnlyContract()
      const tokenIds = await contract.getFarmerCrops(farmerAddress)
      return tokenIds.map((id: any) => id.toString())
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to get farmer crops'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [getReadOnlyContract])

  // Get all active crops
  const getActiveCrops = useCallback(async (): Promise<string[]> => {
    try {
      const contract = await getReadOnlyContract()
      const tokenIds = await contract.getActiveCrops()
      return tokenIds.map((id: any) => id.toString())
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to get active crops'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [getReadOnlyContract])

  // Check if farmer is verified
  const isFarmerVerified = useCallback(async (farmerAddress: string): Promise<boolean> => {
    try {
      const contract = await getReadOnlyContract()
      return await contract.isFarmerVerified(farmerAddress)
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to check farmer verification'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [getReadOnlyContract])

  // Get current token ID (for tracking)
  const getCurrentTokenId = useCallback(async (): Promise<string> => {
    try {
      const contract = await getReadOnlyContract()
      const tokenId = await contract.getCurrentTokenId()
      return tokenId.toString()
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to get current token ID'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [getReadOnlyContract])

  // Direct purchase
  const directPurchase = useCallback(async (tokenId: string, priceInEth: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const contract = await getContract()
      const tx = await contract.directPurchase(tokenId, {
        value: ethers.parseEther(priceInEth)
      })
      
      const receipt = await tx.wait()
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to purchase crop'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [getContract])

  // Create auction
  const createAuction = useCallback(async (
    tokenId: string,
    startingPriceEth: string,
    reservePriceEth: string,
    bidIncrementEth: string,
    durationHours: number
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const contract = await getContract()
      const durationSeconds = durationHours * 3600
      
      const tx = await contract.createAuction(
        tokenId,
        ethers.parseEther(startingPriceEth),
        ethers.parseEther(reservePriceEth),
        ethers.parseEther(bidIncrementEth),
        durationSeconds
      )
      
      const receipt = await tx.wait()
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to create auction'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [getContract])

  return {
    // State
    loading,
    error,
    
    // Functions
    createCropCertificate,
    getCropCertificate,
    getFarmerCrops,
    getActiveCrops,
    isFarmerVerified,
    getCurrentTokenId,
    directPurchase,
    createAuction,
    testConnection,
    
    // Utils
    clearError: () => setError(null)
  }
}