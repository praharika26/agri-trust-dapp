"use client"

import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MyCropsPage() {
  const { userRole } = useUser()
  const router = useRouter()

  if (userRole !== "farmer") {
    router.push("/")
    return null
  }

  const myCrops = [
    {
      id: "1",
      cropName: "Organic Tomatoes",
      cropType: "vegetable",
      quantity: 100,
      unit: "kg",
      price: "0.5",
      status: "active",
    },
    {
      id: "2",
      cropName: "Premium Wheat",
      cropType: "grain",
      quantity: 500,
      unit: "kg",
      price: "0.3",
      status: "active",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-900">My Crops</h1>
          <Button onClick={() => router.push("/register-crop")} className="bg-emerald-600 hover:bg-emerald-700">
            + New Crop
          </Button>
        </div>

        <div className="grid gap-6">
          {myCrops.map((crop) => (
            <div key={crop.id} className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900">{crop.cropName}</h3>
                  <p className="text-emerald-600">{crop.cropType}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                  {crop.status}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Quantity</p>
                  <p className="font-semibold text-emerald-900">
                    {crop.quantity} {crop.unit}
                  </p>
                </div>
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Price</p>
                  <p className="font-semibold text-emerald-900">{crop.price} ETH</p>
                </div>
                <div>
                  <p className="text-emerald-600 text-sm mb-1">Total Value</p>
                  <p className="font-semibold text-emerald-900">
                    {((crop.quantity / 100) * Number.parseFloat(crop.price)).toFixed(2)} ETH
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={`/crop/${crop.id}`}>
                  <Button variant="outline" className="border-emerald-300 bg-transparent">
                    View Details
                  </Button>
                </Link>
                <Button variant="destructive">Delist</Button>
              </div>
            </div>
          ))}
        </div>

        {myCrops.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200 text-center">
            <p className="text-emerald-700 mb-4">You haven't listed any crops yet</p>
            <Button onClick={() => router.push("/register-crop")} className="bg-emerald-600 hover:bg-emerald-700">
              Register Your First Crop
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
