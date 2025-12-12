import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACTS, AGRITRUST_ABI, TOKEN_ABI, ESCROW_ABI } from '@/lib/web3/config'
import { toast } from '@/hooks/use-toast'

// Crop Management Hooks
export function useRegisterCrop() {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONTRACTS.AGRITRUST.address,
    abi: AGRITRUST_ABI,
    functionName: 'registerCrop',
  })

  const { data, write, error, isLoading } = useContractWrite(config)

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      toast({
        title: "Crop registered successfully!",
        description: "Your crop has been registered on the blockchain",
      })
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  return {
    registerCrop: write,
    data,
    error: error || prepareError,
    isLoading: isLoading || isConfirming,
    isSuccess,
  }
}

export function useGetCrop(cropId?: number) {
  return useContractRead({
    address: CONTRACTS.AGRITRUST.address,
    abi: AGRITRUST_ABI,
    functionName: 'getCrop',
    args: cropId ? [BigInt(cropId)] : undefined,
    enabled: !!cropId,
  })
}

export function useGetFarmerCrops(farmerAddress?: string) {
  return useContractRead({
    address: CONTRACTS.AGRITRUST.address,
    abi: AGRITRUST_ABI,
    functionName: 'getFarmerCrops',
    args: farmerAddress ? [farmerAddress as `0x${string}`] : undefined,
    enabled: !!farmerAddress,
  })
}

// Auction Management Hooks
export function useCreateAuction() {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONTRACTS.AGRITRUST.address,
    abi: AGRITRUST_ABI,
    functionName: 'createAuction',
  })

  const { data, write, error, isLoading } = useContractWrite(config)

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      toast({
        title: "Auction created!",
        description: "Your crop auction is now live on the blockchain",
      })
    },
    onError: (error) => {
      toast({
        title: "Auction creation failed",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  return {
    createAuction: write,
    data,
    error: error || prepareError,
    isLoading: isLoading || isConfirming,
    isSuccess,
  }
}

export function usePlaceBid() {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONTRACTS.AGRITRUST.address,
    abi: AGRITRUST_ABI,
    functionName: 'placeBid',
  })

  const { data, write, error, isLoading } = useContractWrite(config)

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      toast({
        title: "Bid placed successfully!",
        description: "Your bid has been recorded on the blockchain",
      })
    },
    onError: (error) => {
      toast({
        title: "Bid failed",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  return {
    placeBid: write,
    data,
    error: error || prepareError,
    isLoading: isLoading || isConfirming,
    isSuccess,
  }
}

// Token Hooks
export function useTokenBalance(address?: string) {
  return useContractRead({
    address: CONTRACTS.TOKEN.address,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    enabled: !!address,
    watch: true,
  })
}

export function useUserRewards(address?: string) {
  return useContractRead({
    address: CONTRACTS.TOKEN.address,
    abi: TOKEN_ABI,
    functionName: 'getUserRewards',
    args: address ? [address as `0x${string}`] : undefined,
    enabled: !!address,
  })
}

// Escrow Hooks
export function useCreateEscrow() {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONTRACTS.ESCROW.address,
    abi: ESCROW_ABI,
    functionName: 'createEscrow',
  })

  const { data, write, error, isLoading } = useContractWrite(config)

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      toast({
        title: "Escrow created!",
        description: "Your secure transaction has been initiated",
      })
    },
    onError: (error) => {
      toast({
        title: "Escrow creation failed",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  return {
    createEscrow: write,
    data,
    error: error || prepareError,
    isLoading: isLoading || isConfirming,
    isSuccess,
  }
}

export function useGetEscrowTransaction(transactionId?: number) {
  return useContractRead({
    address: CONTRACTS.ESCROW.address,
    abi: ESCROW_ABI,
    functionName: 'getTransaction',
    args: transactionId ? [BigInt(transactionId)] : undefined,
    enabled: !!transactionId,
  })
}

// Utility Hooks
export function useContractHelpers() {
  const parsePrice = (price: string) => {
    try {
      return parseEther(price)
    } catch {
      return BigInt(0)
    }
  }

  const formatPrice = (price: bigint) => {
    try {
      return formatEther(price)
    } catch {
      return '0'
    }
  }

  const validateAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  return {
    parsePrice,
    formatPrice,
    validateAddress,
  }
}

// Event Listening Hook
export function useContractEvents() {
  // This would be implemented with wagmi's event listening capabilities
  // For now, we'll use the database for event tracking
  
  const subscribeToEvents = (eventName: string, callback: (event: any) => void) => {
    // Implementation would depend on your event listening strategy
    console.log(`Subscribing to ${eventName} events`)
  }

  return {
    subscribeToEvents,
  }
}