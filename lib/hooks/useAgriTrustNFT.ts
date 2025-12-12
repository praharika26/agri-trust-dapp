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

  const getContract = useCallback(async () => {
    const contractAddress = process.env.NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT
    if (!contractAddress) {
      throw new Error('AgriTrust NFT contract address not configured')
    }

    const wallet = wallets[0]
    if (!wallet) {
      throw new Error('No wallet connected')
    }

    await wallet.switchChain(parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'))
    const provider = await wallet.getEthersProvider()
    const signer = provider.getSigner()
    
    return new ethers.Contract(contractAddress, AGRITRUST_NFT_ABI, signer)
  }, [wallets])

  const getReadOnlyContract = useCallback(async () => {
    const contractAddress = process.env.NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT
    if (!contractAddress) {
      throw new Error('AgriTrust NFT contract address not configured')
    }

    const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/a0bb1a1f8b434089b6f603804851a5ac'
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    
    return new ethers.Contract(contractAddress, AGRITRUST_NFT_ABI, provider)
  }, [])

  // Create crop certificate NFT
  const createCropCertificate = useCallback(async (params: CreateCropParams) => {
    setLoading(true)
    setError(null)
    
    try {
      const contract = await getContract()
      
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
        ethers.parseEther(params.minimumPrice.toString()),
        ethers.parseEther(params.buyoutPrice.toString()),
        params.ipfsMetadata
      )
      
      const receipt = await tx.wait()
      
      // Find the CropCertificateCreated event
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
      }
      
      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId,
        blockNumber: receipt.blockNumber
      }
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to create crop certificate'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [getContract])

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
    
    // Utils
    clearError: () => setError(null)
  }
}