"use client"

import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"

export default function PurchaseHistoryPage() {
  const { userRole } = useUser()
  const router = useRouter()

  if (userRole !== "user") {
    router.push("/")
    return null
  }

  const purchases = [
    {
      id: "1",
      cropName: "Organic Tomatoes",
      farmerAddress: "0x1234...5678",
      quantity: 25,
      unit: "kg",
      totalPrice: "12 ETH",
      date: "2024-01-10",
      transactionHash: "0x123...abc",
    },
    {
      id: "2",
      cropName: "Premium Wheat",
      farmerAddress: "0x9876...5432",
      quantity: 50,
      unit: "kg",
      totalPrice: "14 ETH",
      date: "2024-01-08",
      transactionHash: "0x456...def",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-8">Purchase History</h1>

        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">{purchase.cropName}</h3>
                  <p className="text-emerald-600 text-sm">Farmer: {purchase.farmerAddress}</p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Completed
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Quantity</p>
                  <p className="font-semibold text-emerald-900">
                    {purchase.quantity} {purchase.unit}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Total Price</p>
                  <p className="font-semibold text-emerald-900">{purchase.totalPrice}</p>
                </div>
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Date</p>
                  <p className="font-semibold text-emerald-900">{purchase.date}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-200">
                <a
                  href={`https://sepolia.etherscan.io/tx/${purchase.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-mono"
                >
                  TX: {purchase.transactionHash}
                </a>
              </div>
            </div>
          ))}
        </div>

        {purchases.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <p className="text-emerald-700">No purchases yet</p>
          </div>
        )}
      </div>
    </main>
  )
}
