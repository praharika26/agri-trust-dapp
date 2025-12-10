"use client"

import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function MyBidsPage() {
  const { userRole } = useUser()
  const router = useRouter()

  if (userRole !== "user") {
    router.push("/")
    return null
  }

  const bids = [
    {
      id: "1",
      cropName: "Organic Tomatoes",
      farmerAddress: "0x1234...5678",
      quantity: 25,
      unit: "kg",
      bidPrice: "0.48",
      listingPrice: "0.5",
      status: "active",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      cropName: "Premium Wheat",
      farmerAddress: "0x9876...5432",
      quantity: 50,
      unit: "kg",
      bidPrice: "0.28",
      listingPrice: "0.3",
      status: "accepted",
      createdAt: "2024-01-14",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-8">My Bids</h1>

        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid.id} className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">{bid.cropName}</h3>
                  <p className="text-emerald-600 text-sm">Farmer: {bid.farmerAddress}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bid.status === "accepted" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Quantity</p>
                  <p className="font-semibold text-emerald-900">
                    {bid.quantity} {bid.unit}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Your Bid</p>
                  <p className="font-semibold text-emerald-900">{bid.bidPrice} ETH</p>
                </div>
                <div>
                  <p className="text-emerald-600 text-sm mb-1">List Price</p>
                  <p className="font-semibold text-emerald-900 line-through">{bid.listingPrice} ETH</p>
                </div>
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Savings</p>
                  <p className="font-semibold text-green-600">
                    {((Number.parseFloat(bid.listingPrice) - Number.parseFloat(bid.bidPrice)) * bid.quantity).toFixed(
                      2,
                    )}{" "}
                    ETH
                  </p>
                </div>
              </div>

              {bid.status === "active" && (
                <div className="flex gap-3">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Edit Bid</Button>
                  <Button variant="destructive">Cancel Bid</Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {bids.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <p className="text-emerald-700 mb-4">You haven't placed any bids yet</p>
            <Button onClick={() => router.push("/marketplace")} className="bg-emerald-600 hover:bg-emerald-700">
              Browse Marketplace
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
