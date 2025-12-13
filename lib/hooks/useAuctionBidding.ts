import { useState, useCallback } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'

// AgriTrust Auction & Bidding ABI
const AUCTION_BIDDING_ABI = [
  // Auction functions
  "function createAuction(uint256 tokenId, uint256 startingPrice, uint256 reservePrice, uint256 bidIncrement, uint256 duration) external returns (uint256)",
  "function placeBid(uint256 auctionId) external payable",
  "function finalizeAuction(uint256 auctionId) external",
  
  // View functions
  "function getAuction(uint256 auctionId) external view returns (tuple(uint256 auctionId, uint256 tokenId, address seller, uint256 startingPrice, uint256 reservePrice, uint256 currentBid, address highestBidder, uint256 bidIncrement, uint256 startTime, uint256 endTime, bool isActive, bool isFinalized))",
  "function getAuctionBids(uint256 auctionId) external view returns (tuple(address bidder, uint256 amount, uint256 timestamp)[])",
  
  // Events
  "event AuctionCreated(uint256 indexed auctionId, uint256 indexed tokenId, uint256 startingPrice)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event AuctionFinalized(uint256 indexed auctionId, address indexed winner, uint256 finalPrice)"
]

export interface AuctionData {
  auctionId: string
  tokenId: string
  seller: string
  startingPrice: string
  reservePrice: string
  currentBid: string
  highestBidder: string
  bidIncrement: string
  startTime: string
  endTime: string
  isActive: boolean
  isFinalized: boolean
}

export interface BidData {
  bidder: string
  amount: string
  timestamp: string
}

export interface CreateAuctionParams {
  tokenId: string
  startingPrice: number // In USD, will be converted to ETH
  reservePrice?: number // In USD, will be converted to ETH
  bidIncrement?: number // In USD, will be converted to ETH
  durationHours: number
}

export interface PlaceBidParams {
  auctionId: string
  bidAmount: number // In USD, will be converted to ETH
}

export function useAuctionBidding() {
  const { wallets } = useWallets()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock USD to ETH conversion rate (in production, fetch from an API)
  const USD_TO_ETH_RATE = 0.0005 // 1 USD = 0.0005 ETH (example rate)

  const convertUsdToEth = (usdAmount: number): string => {
    return (usdAmount * USD_TO_ETH_RATE).toString()
  }

  const getContract = useCallback(async () => {
    console.log('🔍 Getting Auction contract...')
    
    const contractAddress = process.env.NEXT_PUBLIC_AGRITRUST_NFT_CONTRACT
    console.log('📍 Contract address:', contractAddress)
    
    if (!contractAddress) {
      throw new Error('AgriTrust contract address not configured. Please deploy the contract first.')
    }

    const wallet = wallets[0]
    if (!wallet) {
      throw new Error('No wallet connected')
    }

    const targetChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337')
    console.log('🔗 Target chain ID:', targetChainId)
    
    try {
      console.log('🔄 Switching wallet to chain:', targetChainId)
      await wallet.switchChain(targetChainId)
      console.log('✅ Chain switch successful')
    } catch (switchError: any) {
      console.log('⚠️ Chain switch failed, attempting to add network:', switchError.message)
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
    const provider = new ethers.BrowserProvider(ethereumProvider)
    const signer = await provider.getSigner()
    
    console.log('📄 Creating contract instance...')
    const contract = new ethers.Contract(contractAddress, AUCTION_BIDDING_ABI, signer)
    console.log('✅ Contract instance created successfully')
    
    return contract
  }, [wallets])

  // Create auction with blockchain transaction
  const createAuction = useCallback(async (params: CreateAuctionParams) => {
    console.log('🚀 Starting auction creation process...')
    console.log('📋 Parameters:', params)
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('📄 Getting contract instance...')
      const contract = await getContract()
      
      // Convert USD prices to ETH
      const startingPriceEth = ethers.parseEther(convertUsdToEth(params.startingPrice))
      const reservePriceEth = params.reservePrice 
        ? ethers.parseEther(convertUsdToEth(params.reservePrice))
        : startingPriceEth
      const bidIncrementEth = params.bidIncrement 
        ? ethers.parseEther(convertUsdToEth(params.bidIncrement))
        : ethers.parseEther(convertUsdToEth(10)) // Default $10 increment
      
      const durationSeconds = params.durationHours * 3600
      
      console.log('💰 Converted prices:', {
        startingPriceUSD: params.startingPrice,
        startingPriceEth: ethers.formatEther(startingPriceEth),
        reservePriceEth: ethers.formatEther(reservePriceEth),
        bidIncrementEth: ethers.formatEther(bidIncrementEth),
        durationSeconds
      })
      
      console.log('📝 Calling createAuction on blockchain...')
      const tx = await contract.createAuction(
        params.tokenId,
        startingPriceEth,
        reservePriceEth,
        bidIncrementEth,
        durationSeconds
      )
      
      console.log('⏳ Transaction sent, waiting for confirmation...', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ Transaction confirmed:', receipt)
      
      // Find the AuctionCreated event
      console.log('🔍 Looking for AuctionCreated event...')
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed?.name === 'AuctionCreated'
        } catch {
          return false
        }
      })
      
      let auctionId = null
      if (event) {
        const parsed = contract.interface.parseLog(event)
        auctionId = parsed?.args[0]?.toString()
        console.log('🎯 Found auctionId:', auctionId)
      } else {
        console.log('⚠️ AuctionCreated event not found in logs')
      }
      
      const result = {
        success: true,
        transactionHash: receipt.hash,
        auctionId,
        blockNumber: receipt.blockNumber
      }
      
      console.log('🎉 Auction creation successful:', result)
      return result
    } catch (err: any) {
      console.error('❌ Auction creation failed:', err)
      const errorMessage = err.reason || err.message || 'Failed to create auction'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [getContract])

  // Place bid with blockchain transaction
  const placeBid = useCallback(async (params: PlaceBidParams) => {
    console.log('🚀 Starting bid placement process...')
    console.log('📋 Parameters:', params)
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('📄 Getting contract instance...')
      const contract = await getContract()
      
      // Convert USD bid amount to ETH
      const bidAmountEth = ethers.parseEther(convertUsdToEth(params.bidAmount))
      
      console.log('💰 Converted bid amount:', {
        bidAmountUSD: params.bidAmount,
        bidAmountEth: ethers.formatEther(bidAmountEth)
      })
      
      console.log('📝 Calling placeBid on blockchain...')
      const tx = await contract.placeBid(params.auctionId, {
        value: bidAmountEth
      })
      
      console.log('⏳ Transaction sent, waiting for confirmation...', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ Transaction confirmed:', receipt)
      
      // Find the BidPlaced event
      console.log('🔍 Looking for BidPlaced event...')
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed?.name === 'BidPlaced'
        } catch {
          return false
        }
      })
      
      let bidAmount = null
      if (event) {
        const parsed = contract.interface.parseLog(event)
        bidAmount = parsed?.args[2]?.toString()
        console.log('🎯 Found bid amount:', bidAmount)
      } else {
        console.log('⚠️ BidPlaced event not found in logs')
      }
      
      const result = {
        success: true,
        transactionHash: receipt.hash,
        bidAmount: bidAmount ? ethers.formatEther(bidAmount) : null,
        blockNumber: receipt.blockNumber
      }
      
      console.log('🎉 Bid placement successful:', result)
      return result
    } catch (err: any) {
      console.error('❌ Bid placement failed:', err)
      const errorMessage = err.reason || err.message || 'Failed to place bid'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [getContract])

  // Finalize auction
  const finalizeAuction = useCallback(async (auctionId: string) => {
    console.log('🚀 Starting auction finalization process...')
    console.log('📋 Auction ID:', auctionId)
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('📄 Getting contract instance...')
      const contract = await getContract()
      
      console.log('📝 Calling finalizeAuction on blockchain...')
      const tx = await contract.finalizeAuction(auctionId)
      
      console.log('⏳ Transaction sent, waiting for confirmation...', tx.hash)
      const receipt = await tx.wait()
      console.log('✅ Transaction confirmed:', receipt)
      
      const result = {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
      
      console.log('🎉 Auction finalization successful:', result)
      return result
    } catch (err: any) {
      console.error('❌ Auction finalization failed:', err)
      const errorMessage = err.reason || err.message || 'Failed to finalize auction'
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
    createAuction,
    placeBid,
    finalizeAuction,
    
    // Utils
    clearError: () => setError(null),
    convertUsdToEth
  }
}