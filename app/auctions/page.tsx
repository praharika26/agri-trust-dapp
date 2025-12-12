"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/context/user-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Clock, Gavel, Users, TrendingUp, Loader2, MapPin, Calendar, Award, Shield } from "lucide-react"
import type { Auction, PaginatedResponse } from "@/lib/types/database"

export default function AuctionsPage() {
  const { userRole, isAuthenticated } = useUser()
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    total_pages: 0,
  })

  useEffect(() => {
    fetchAuctions()
  }, [pagination.page])

  const fetchAuctions = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: 'active',
      })

      const response = await fetch(`/api/auctions?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch auctions')
      }
      
      const data: PaginatedResponse<Auction> = await response.json()
      setAuctions(data.data)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        total_pages: data.pagination.total_pages,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch auctions')
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-8">Live Auctions</h1>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-emerald-700">Loading auctions...</span>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-8">Live Auctions</h1>
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={fetchAuctions} className="mt-4">
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-900">Live Auctions</h1>
          <div className="flex items-center gap-2 text-emerald-700">
            <Gavel className="w-5 h-5" />
            <span>{pagination.total} active auctions</span>
          </div>
        </div>

        {auctions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-emerald-200">
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">No Active Auctions</h3>
            <p className="text-emerald-700">Check back later for new auctions</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-emerald-700">
                Showing {auctions.length} of {pagination.total} auctions
              </p>
            </div>

            {/* Auction Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {auctions.map((auction) => (
                <Link key={auction.id} href={`/crop/${auction.crop_id}`}>
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-orange-200 hover:border-orange-400">
                    <CardHeader className="p-0">
                      <div className="relative">
                        {auction.crop?.images && auction.crop.images.length > 0 ? (
                          <img
                            src={auction.crop.images[0]}
                            alt={auction.crop.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-4xl rounded-t-lg">
                            🏛️
                          </div>
                        )}
                        
                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 flex gap-2">
                          <Badge className="bg-orange-500 hover:bg-orange-600">
                            <Gavel className="w-3 h-3 mr-1" />
                            Live Auction
                          </Badge>
                        </div>

                        {/* Time Remaining */}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-red-500 hover:bg-red-600">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeRemaining(auction.end_time.toString())}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg text-emerald-900 mb-2 line-clamp-1">
                        {auction.crop?.title}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-emerald-700">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{auction.crop?.crop_type}</span>
                          <span>• {auction.crop?.quantity} {auction.crop?.unit}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span className="text-xs">{auction.total_bids || 0} bids</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-xs">Farmer: {auction.crop?.farmer?.wallet_address?.slice(0, 6)}...{auction.crop?.farmer?.wallet_address?.slice(-4)}</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="text-xs text-gray-500">Current Bid</div>
                            <div className="text-lg font-bold text-orange-600">
                              ${auction.current_highest_bid || auction.starting_price}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Starting Price</div>
                            <div className="text-sm text-emerald-600">
                              ${auction.starting_price}
                            </div>
                          </div>
                        </div>
                        
                        <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Place Bid
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                
                <span className="flex items-center px-4 text-emerald-700">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.total_pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}