"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/context/user-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Crop {
  id: string
  cropName: string
  cropType: string
  quantity: number
  unit: string
  price: string
  imageHash: string
  farmerAddress: string
}

export default function MarketplacePage() {
  const { userRole } = useUser()
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCrops()
  }, [])

  const fetchCrops = async () => {
    try {
      const response = await fetch("/api/crops/list")
      const data = await response.json()
      setCrops(data.crops || [])
    } catch (error) {
      console.error("Failed to fetch crops:", error)
    } finally {
      setLoading(false)
    }
  }

  if (userRole !== "user") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">Access Denied</h1>
          <p className="text-emerald-700">Switch to buyer role to access marketplace</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-8">Marketplace</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-emerald-700">Loading crops...</p>
          </div>
        ) : crops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-emerald-200">
            <p className="text-emerald-700">No crops available yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <Link key={crop.id} href={`/crop/${crop.id}`}>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-200 hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="w-full h-40 bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-4xl">
                    🌾
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-emerald-900">{crop.cropName}</h3>
                    <p className="text-emerald-700 text-sm mb-2">{crop.cropType}</p>
                    <p className="text-emerald-600 text-sm mb-4">
                      {crop.quantity} {crop.unit}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-emerald-600">{crop.price} ETH</span>
                      <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
