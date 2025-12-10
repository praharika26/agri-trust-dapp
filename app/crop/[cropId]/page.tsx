"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface CropDetail {
  id: string
  cropName: string
  cropType: string
  quantity: number
  unit: string
  price: string
  description: string
  imageHash: string
  farmerAddress: string
  createdAt: string
}

export default function CropDetailPage() {
  const params = useParams()
  const cropId = params?.cropId as string
  const [crop, setCrop] = useState<CropDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState(false)

  useEffect(() => {
    if (cropId) {
      fetchCropDetail()
    }
  }, [cropId])

  const fetchCropDetail = async () => {
    try {
      const response = await fetch(`/api/crops/${cropId}`)
      const data = await response.json()
      setCrop(data.crop)
    } catch (error) {
      console.error("Failed to fetch crop details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <p className="text-emerald-700">Loading...</p>
      </div>
    )
  }

  if (!crop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <p className="text-emerald-700">Crop not found</p>
      </div>
    )
  }

  const ipfsUrl = `https://ipfs.io/ipfs/${crop.imageHash}`

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white rounded-xl overflow-hidden border border-emerald-200 h-96">
            <img
              src={ipfsUrl || "/placeholder.svg"}
              alt={crop.cropName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg"
              }}
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-emerald-900 mb-2">{crop.cropName}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium">
                  {crop.cropType}
                </span>
                <span className="text-emerald-600 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Blockchain Verified
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
              <p className="text-emerald-600 text-sm mb-2">Price</p>
              <p className="text-3xl font-bold text-emerald-900">{crop.price} ETH</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <p className="text-emerald-600 text-sm mb-1">Quantity</p>
                <p className="text-xl font-bold text-emerald-900">
                  {crop.quantity} {crop.unit}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <p className="text-emerald-600 text-sm mb-1">Farmer</p>
                <p className="text-sm font-mono text-emerald-900">
                  {crop.farmerAddress.slice(0, 6)}...{crop.farmerAddress.slice(-4)}
                </p>
              </div>
            </div>

            {crop.description && (
              <div className="bg-white rounded-lg p-6 border border-emerald-200">
                <h3 className="font-bold text-emerald-900 mb-3">Description</h3>
                <p className="text-emerald-700">{crop.description}</p>
              </div>
            )}

            <Button
              onClick={() => setBidding(true)}
              disabled={bidding}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg"
            >
              {bidding ? "Placing Bid..." : "Place Bid"}
            </Button>

            <div className="text-xs text-emerald-600 text-center">
              <p>IPFS Hash: {crop.imageHash.slice(0, 10)}...</p>
              <p>Listed on: {new Date(crop.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
