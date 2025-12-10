"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import PinataUploader from "@/components/pinata-uploader"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

export default function RegisterCropPage() {
  const { userRole, walletAddress } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState({
    cropName: "",
    cropType: "",
    quantity: "",
    unit: "kg",
    description: "",
    price: "",
  })
  const [imageHash, setImageHash] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  if (userRole !== "farmer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">Access Denied</h1>
          <p className="text-emerald-700">Only farmers can register crops</p>
        </div>
      </div>
    )
  }

  const handleImageUpload = (ipfsHash: string, ipfsUrl: string) => {
    setImageHash(ipfsHash)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageHash) {
      alert("Please upload an image")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/crops/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageHash,
          farmerAddress: walletAddress,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => router.push("/my-crops"), 2000)
      }
    } catch (error) {
      alert("Failed to register crop")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-8">Register Your Crop</h1>

        {success ? (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-emerald-200 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Crop Registered Successfully!</h2>
            <p className="text-emerald-700">Redirecting to your crops...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-8 border border-emerald-200 space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">Crop Image</label>
              <PinataUploader onUploadComplete={handleImageUpload} />
              {imageHash && (
                <p className="text-xs text-emerald-600 mt-2">Image uploaded: {imageHash.slice(0, 10)}...</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">Crop Name</label>
                <Input
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleInputChange}
                  placeholder="e.g., Organic Tomatoes"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">Crop Type</label>
                <select
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                >
                  <option value="">Select type</option>
                  <option value="vegetable">Vegetable</option>
                  <option value="grain">Grain</option>
                  <option value="fruit">Fruit</option>
                  <option value="dairy">Dairy</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">Quantity</label>
                <Input
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="ton">Ton</option>
                  <option value="liter">Liter</option>
                  <option value="piece">Piece</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">Price per Unit (ETH)</label>
              <Input
                name="price"
                type="number"
                step="0.0001"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-emerald-900 mb-2">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your crop, growing practices, certifications, etc."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !imageHash}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? "Registering..." : "Register Crop"}
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
