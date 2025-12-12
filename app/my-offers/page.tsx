"use client"

import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface Offer {
  id: string
  crop_id: string
  buyer_id: string
  quantity: number
  price_per_unit: number
  total_amount: number
  status: string
  message?: string
  created_at: string
  expires_at?: string
  buyer: {
    id: string
    wallet_address: string
    email?: string
  }
  crop: {
    id: string
    title: string
    farmer_id: string
  }
}

export default function MyOffersPage() {
  const { userRole, walletAddress } = useUser()
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  if (userRole !== "farmer") {
    router.push("/")
    return null
  }

  useEffect(() => {
    if (walletAddress) {
      fetchOffers()
    }
  }, [walletAddress])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/offers?wallet_address=${walletAddress}&type=received`)
      if (!response.ok) {
        throw new Error('Failed to fetch offers')
      }
      const data = await response.json()
      setOffers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch offers')
    } finally {
      setLoading(false)
    }
  }

  const handleOfferAction = async (offerId: string, action: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      })

      if (!response.ok) {
        throw new Error('Failed to update offer')
      }

      // Refresh offers
      fetchOffers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update offer')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-8">My Offers</h1>
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <p className="text-emerald-700">Loading offers...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-8">My Offers</h1>
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={fetchOffers} className="mt-4">
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
        <h1 className="text-4xl font-bold text-emerald-900 mb-8">My Offers</h1>

        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">{offer.crop.title}</h3>
                  <p className="text-emerald-600 text-sm">From: {offer.buyer.wallet_address}</p>
                  {offer.message && (
                    <p className="text-emerald-600 text-sm mt-1">Message: {offer.message}</p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    offer.status === "accepted" 
                      ? "bg-green-100 text-green-700" 
                      : offer.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Quantity</p>
                  <p className="font-semibold text-emerald-900">
                    {offer.quantity} units
                  </p>
                </div>
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Price per Unit</p>
                  <p className="font-semibold text-emerald-900">{offer.price_per_unit} ETH</p>
                </div>
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Total Amount</p>
                  <p className="font-semibold text-emerald-900">
                    {offer.total_amount} ETH
                  </p>
                </div>
              </div>

              <div className="text-sm text-emerald-600 mb-4">
                <p>Created: {new Date(offer.created_at).toLocaleDateString()}</p>
                {offer.expires_at && (
                  <p>Expires: {new Date(offer.expires_at).toLocaleDateString()}</p>
                )}
              </div>

              {offer.status === "pending" && (
                <div className="flex gap-3">
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleOfferAction(offer.id, 'accepted')}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleOfferAction(offer.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {offers.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <p className="text-emerald-700">No offers received yet</p>
          </div>
        )}
      </div>
    </main>
  )
}
