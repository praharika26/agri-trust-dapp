"use client"

import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Loader2, Clock, Gavel } from "lucide-react"
import Link from "next/link"

interface Bid {
  id: string
  auction_id: string
  amount: number
  bid_time: string
  is_winning: boolean
  transaction_hash?: string
  auction: {
    id: string
    status: string
    end_time: string
    starting_price: number
    current_highest_bid?: number
    crop: {
      id: string
      title: string
      crop_type: string
      quantity: number
      unit: string
      farmer: {
        id: string
        wallet_address: string
        email?: string
      }
    }
  }
}

export default function MyBidsPage() {
  const { userRole, walletAddress } = useUser()
  const router = useRouter()
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  if (userRole !== "user") {
    router.push("/")
    return null
  }

  useEffect(() => {
    if (walletAddress) {
      fetchBids()
    }
  }, [walletAddress])

  const fetchBids = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bids?wallet_address=${walletAddress}`)
      if (!response.ok) {
        throw new Error('Failed to fetch bids')
      }
      const data = await response.json()
      setBids(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bids')
    } finally {
      setLoading(false)
    }
  }

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime()
    const end = new Date(endTime).getTime()
    const diff = end - now

    if (diff <= 0) return "Ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getAuctionStatus = (auction: Bid['auction']) => {
    const timeRemaining = getTimeRemaining(auction.end_time)
    if (timeRemaining === "Ended") return "ended"
    return auction.status
  }

  const getBidStatus = (bid: Bid) => {
    const auctionStatus = getAuctionStatus(bid.auction)
    if (auctionStatus === "ended") {
      return bid.is_winning ? "won" : "lost"
    }
    return bid.is_winning ? "winning" : "outbid"
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-8">My Bids</h1>
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-emerald-700">Loading your bids...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-8">My Bids</h1>
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={fetchBids} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-8">My Bids</h1>

        <div className="space-y-4">
          {bids.map((bid) => {
            const bidStatus = getBidStatus(bid)
            const timeRemaining = getTimeRemaining(bid.auction.end_time)
            
            return (
              <div key={bid.id} className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link href={`/crop/${bid.auction.crop.id}`} className="hover:underline">
                      <h3 className="text-xl font-bold text-emerald-900">{bid.auction.crop.title}</h3>
                    </Link>
                    <p className="text-emerald-600 text-sm">
                      Farmer: {bid.auction.crop.farmer.wallet_address.slice(0, 6)}...{bid.auction.crop.farmer.wallet_address.slice(-4)}
                    </p>
                    <p className="text-emerald-600 text-sm">
                      Bid placed: {new Date(bid.bid_time).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge
                      className={`${
                        bidStatus === "won" 
                          ? "bg-green-500 hover:bg-green-600" 
                          : bidStatus === "winning"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : bidStatus === "lost"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      }`}
                    >
                      {bidStatus === "won" && "🏆 Won"}
                      {bidStatus === "winning" && "🥇 Winning"}
                      {bidStatus === "lost" && "❌ Lost"}
                      {bidStatus === "outbid" && "⚠️ Outbid"}
                    </Badge>
                    
                    {timeRemaining !== "Ended" && (
                      <Badge className="bg-orange-500 hover:bg-orange-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {timeRemaining}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-emerald-600 text-sm mb-1">Crop Details</p>
                    <p className="font-semibold text-emerald-900">
                      {bid.auction.crop.quantity} {bid.auction.crop.unit}
                    </p>
                    <p className="text-sm text-emerald-600">{bid.auction.crop.crop_type}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 text-sm mb-1">Your Bid</p>
                    <p className="font-semibold text-emerald-900">${bid.amount}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 text-sm mb-1">Starting Price</p>
                    <p className="font-semibold text-emerald-900">${bid.auction.starting_price}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 text-sm mb-1">Current Highest</p>
                    <p className="font-semibold text-emerald-900">
                      ${bid.auction.current_highest_bid || bid.auction.starting_price}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-emerald-600">
                    {bid.transaction_hash && (
                      <p>TX: {bid.transaction_hash.slice(0, 10)}...{bid.transaction_hash.slice(-6)}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Link href={`/crop/${bid.auction.crop.id}`}>
                      <Button variant="outline" size="sm">
                        <Gavel className="w-4 h-4 mr-2" />
                        View Auction
                      </Button>
                    </Link>
                    
                    {bidStatus === "outbid" && timeRemaining !== "Ended" && (
                      <Link href={`/crop/${bid.auction.crop.id}`}>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          Place Higher Bid
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {bids.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">No Bids Yet</h3>
            <p className="text-emerald-700 mb-4">You haven't placed any bids yet</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/auctions")} className="bg-orange-600 hover:bg-orange-700">
                Browse Auctions
              </Button>
              <Button onClick={() => router.push("/marketplace")} variant="outline" className="border-emerald-300">
                Browse Marketplace
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
