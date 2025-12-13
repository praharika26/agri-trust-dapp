import { useState, useEffect } from 'react'
import { useUser } from '@/context/user-context'

export interface ActivityItem {
  id: string
  type: 'auction_ended' | 'bid_received' | 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'crop_sold' | 'purchase_completed'
  title: string
  description: string
  amount?: number
  status?: string
  timestamp: string
  crop_title?: string
}

export function useRecentActivity(limit: number = 10) {
  const { walletAddress, userRole } = useUser()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivity() {
      if (!walletAddress || !userRole) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/activity?wallet_address=${walletAddress}&type=${userRole}&limit=${limit}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch recent activity')
        }

        const data = await response.json()
        setActivities(data)
      } catch (err) {
        console.error('Error fetching recent activity:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch recent activity')
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [walletAddress, userRole, limit])

  const refetch = async () => {
    if (!walletAddress || !userRole) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/activity?wallet_address=${walletAddress}&type=${userRole}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch recent activity')
      }

      const data = await response.json()
      setActivities(data)
    } catch (err) {
      console.error('Error fetching recent activity:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch recent activity')
    } finally {
      setLoading(false)
    }
  }

  return { activities, loading, error, refetch }
}

// Helper function to format activity timestamp
export function formatActivityTime(timestamp: string): string {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  
  return activityTime.toLocaleDateString()
}

// Helper function to get status color
export function getActivityStatusColor(type: ActivityItem['type'], status?: string): string {
  switch (type) {
    case 'offer_accepted':
    case 'crop_sold':
    case 'purchase_completed':
      return 'text-green-600'
    case 'offer_rejected':
      return 'text-red-600'
    case 'bid_received':
      return 'text-orange-600'
    case 'offer_received':
      return status === 'pending' ? 'text-yellow-600' : 'text-emerald-600'
    default:
      return 'text-emerald-600'
  }
}

// Helper function to format amount
export function formatActivityAmount(amount?: number): string {
  if (!amount) return ''
  
  // Convert from USD to ETH (mock conversion rate)
  const ethAmount = amount / 2000 // Assuming 1 ETH = $2000
  return `${ethAmount.toFixed(3)} ETH`
}