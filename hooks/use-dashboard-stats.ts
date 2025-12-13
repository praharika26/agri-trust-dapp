import { useState, useEffect } from 'react'
import { useUser } from '@/context/user-context'

interface FarmerStats {
  crops: {
    total: number
    active: number
    auction: number
    sold: number
  }
  offers: {
    total: number
    pending: number
    accepted: number
    rejected: number
  }
  auctions: {
    total: number
    active: number
    completed: number
  }
  revenue: {
    total: number
    pending: number
  }
}

interface BuyerStats {
  bids: {
    total: number
    winning: number
    won: number
    lost: number
  }
  offers: {
    total: number
    pending: number
    accepted: number
    rejected: number
  }
  purchases: {
    total: number
    completed: number
    pending: number
  }
  spending: {
    total: number
    pending: number
  }
}

export function useDashboardStats() {
  const { walletAddress, userRole } = useUser()
  const [stats, setStats] = useState<FarmerStats | BuyerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      if (!walletAddress || !userRole) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/stats?wallet_address=${walletAddress}&type=${userRole}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch statistics')
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [walletAddress, userRole])

  const refetch = async () => {
    if (!walletAddress || !userRole) return
    
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/stats?wallet_address=${walletAddress}&type=${userRole}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, error, refetch }
}

// Type guards for better TypeScript support
export function isFarmerStats(stats: FarmerStats | BuyerStats | null): stats is FarmerStats {
  return stats !== null && 'crops' in stats
}

export function isBuyerStats(stats: FarmerStats | BuyerStats | null): stats is BuyerStats {
  return stats !== null && 'bids' in stats
}