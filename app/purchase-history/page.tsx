"use client"

import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, Package, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  crop_id: string
  quantity: number
  price_per_unit: number
  total_amount: number
  status: string
  order_type: string
  transaction_hash?: string
  created_at: string
  updated_at: string
  crop: {
    id: string
    title: string
    crop_type: string
    quantity: number
    unit: string
    images?: string[]
    farmer: {
      id: string
      wallet_address: string
      email?: string
    }
  }
}

export default function PurchaseHistoryPage() {
  const { userRole, walletAddress } = useUser()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  if (userRole !== "user") {
    router.push("/")
    return null
  }

  useEffect(() => {
    if (walletAddress) {
      fetchOrders()
    }
  }, [walletAddress])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders?wallet_address=${walletAddress}&type=buyer`)
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
      shipped: { color: 'bg-purple-100 text-purple-700', label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-700', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-8">Purchase History</h1>
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-emerald-700">Loading your purchase history...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-8">Purchase History</h1>
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={fetchOrders} className="mt-4">
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
        <h1 className="text-4xl font-bold text-emerald-900 mb-8">Purchase History</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link href={`/crop/${order.crop.id}`} className="hover:underline">
                    <h3 className="text-xl font-bold text-emerald-900">{order.crop.title}</h3>
                  </Link>
                  <p className="text-emerald-600 text-sm">
                    Farmer: {order.crop.farmer.wallet_address.slice(0, 6)}...{order.crop.farmer.wallet_address.slice(-4)}
                  </p>
                  <p className="text-emerald-600 text-sm">
                    Order Type: {order.order_type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <p className="text-emerald-600 text-sm">Quantity</p>
                  </div>
                  <p className="font-semibold text-emerald-900">
                    {order.quantity} {order.crop.unit}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <p className="text-emerald-600 text-sm">Price per Unit</p>
                  </div>
                  <p className="font-semibold text-emerald-900">${order.price_per_unit}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <p className="text-emerald-600 text-sm">Total Amount</p>
                  </div>
                  <p className="font-semibold text-emerald-900">${order.total_amount}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <p className="text-emerald-600 text-sm">Order Date</p>
                  </div>
                  <p className="font-semibold text-emerald-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-emerald-200">
                <div>
                  {order.transaction_hash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${order.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-mono flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      TX: {order.transaction_hash.slice(0, 10)}...{order.transaction_hash.slice(-6)}
                    </a>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/crop/${order.crop.id}`}>
                    <Button variant="outline" size="sm">
                      View Crop
                    </Button>
                  </Link>
                  
                  {order.status === 'delivered' && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">No Purchases Yet</h3>
            <p className="text-emerald-700 mb-4">You haven't made any purchases yet</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/marketplace")} className="bg-emerald-600 hover:bg-emerald-700">
                Browse Marketplace
              </Button>
              <Button onClick={() => router.push("/auctions")} variant="outline" className="border-orange-300">
                View Auctions
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
