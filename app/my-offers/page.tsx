"use client"

import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function MyOffersPage() {
  const { userRole } = useUser()
  const router = useRouter()

  if (userRole !== "farmer") {
    router.push("/")
    return null
  }

  const offers = [
    {
      id: "1",
      buyerAddress: "0x1234...5678",
      cropName: "Tomatoes",
      quantity: 50,
      unit: "kg",
      offerPrice: "0.45",
      status: "pending",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      buyerAddress: "0x9876...5432",
      cropName: "Wheat",
      quantity: 100,
      unit: "kg",
      offerPrice: "0.28",
      status: "accepted",
      createdAt: "2024-01-14",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-8">My Offers</h1>

        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">{offer.cropName}</h3>
                  <p className="text-emerald-600 text-sm">From: {offer.buyerAddress}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    offer.status === "accepted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Quantity</p>
                  <p className="font-semibold text-emerald-900">
                    {offer.quantity} {offer.unit}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Offer Price</p>
                  <p className="font-semibold text-emerald-900">{offer.offerPrice} ETH</p>
                </div>
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Total</p>
                  <p className="font-semibold text-emerald-900">
                    {(Number.parseFloat(offer.offerPrice) * offer.quantity).toFixed(2)} ETH
                  </p>
                </div>
              </div>

              {offer.status === "pending" && (
                <div className="flex gap-3">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Accept</Button>
                  <Button variant="destructive">Reject</Button>
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
