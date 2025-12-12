"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import PinataUploader from "@/components/pinata-uploader"
import { useRouter } from "next/navigation"
import { CheckCircle, Calendar, MapPin, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function RegisterCropPage() {
  const { userRole, walletAddress, isAuthenticated } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    crop_type: "",
    variety: "",
    quantity: "",
    unit: "kg",
    harvest_date: "",
    location: "",
    organic_certified: false,
    quality_grade: "",
    moisture_content: "",
    storage_conditions: "",
    minimum_price: "",
    starting_price: "",
    buyout_price: "",
  })
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Check authentication and role
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">Authentication Required</h1>
          <p className="text-emerald-700">Please connect your wallet to register crops</p>
        </div>
      </div>
    )
  }

  if (userRole !== "farmer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">Access Denied</h1>
          <p className="text-emerald-700 mb-4">Only farmers can register crops</p>
          <Button onClick={() => router.push("/switch-role")} className="bg-emerald-600 hover:bg-emerald-700">
            Switch to Farmer Role
          </Button>
        </div>
      </div>
    )
  }

  const handleImageUpload = (ipfsHash: string, ipfsUrl: string) => {
    setImages(prev => [...prev, ipfsUrl])
    toast({
      title: "Image uploaded successfully",
      description: "Your crop image has been uploaded to IPFS",
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : '') : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, organic_certified: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (images.length === 0) {
      toast({
        title: "Image required",
        description: "Please upload at least one image of your crop",
        variant: "destructive",
      })
      return
    }

    if (!walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to register crops",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    
    try {
      const cropData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        minimum_price: formData.minimum_price ? parseFloat(formData.minimum_price) : undefined,
        starting_price: formData.starting_price ? parseFloat(formData.starting_price) : undefined,
        buyout_price: formData.buyout_price ? parseFloat(formData.buyout_price) : undefined,
        moisture_content: formData.moisture_content ? parseFloat(formData.moisture_content) : undefined,
        images,
      }

      const response = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: walletAddress,
          crop_data: cropData,
        }),
      })

      if (response.ok) {
        const crop = await response.json()
        setSuccess(true)
        toast({
          title: "Crop registered successfully!",
          description: "Your crop has been added to the marketplace",
        })
        setTimeout(() => router.push("/my-crops"), 2000)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to register crop")
      }
    } catch (error) {
      console.error("Error registering crop:", error)
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to register crop",
        variant: "destructive",
      })
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
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 border border-emerald-200 space-y-8">
            {/* Images Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-emerald-900">Crop Images</Label>
              <PinataUploader onUploadComplete={handleImageUpload} />
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Crop ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-lg border border-emerald-200"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-emerald-900">Basic Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Crop Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Premium Organic Wheat"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="crop_type">Crop Type *</Label>
                  <Select value={formData.crop_type} onValueChange={(value) => handleSelectChange('crop_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wheat">Wheat</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                      <SelectItem value="corn">Corn</SelectItem>
                      <SelectItem value="barley">Barley</SelectItem>
                      <SelectItem value="soybean">Soybean</SelectItem>
                      <SelectItem value="cotton">Cotton</SelectItem>
                      <SelectItem value="tomato">Tomato</SelectItem>
                      <SelectItem value="potato">Potato</SelectItem>
                      <SelectItem value="onion">Onion</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="variety">Variety</Label>
                  <Input
                    id="variety"
                    name="variety"
                    value={formData.variety}
                    onChange={handleInputChange}
                    placeholder="e.g., Hard Red Winter"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="harvest_date">Harvest Date</Label>
                  <Input
                    id="harvest_date"
                    name="harvest_date"
                    type="date"
                    value={formData.harvest_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your crop, growing practices, certifications, quality, etc."
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Quantity and Location */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-emerald-900">Quantity & Location</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="1000"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                      <SelectItem value="quintal">Quintal</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Punjab, India"
                  />
                </div>
              </div>
            </div>

            {/* Quality Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-emerald-900">Quality Information</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quality_grade">Quality Grade</Label>
                  <Select value={formData.quality_grade} onValueChange={(value) => handleSelectChange('quality_grade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A (Premium)</SelectItem>
                      <SelectItem value="B">Grade B (Good)</SelectItem>
                      <SelectItem value="C">Grade C (Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="moisture_content">Moisture Content (%)</Label>
                  <Input
                    id="moisture_content"
                    name="moisture_content"
                    type="number"
                    step="0.1"
                    value={formData.moisture_content}
                    onChange={handleInputChange}
                    placeholder="12.5"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="organic_certified"
                    checked={formData.organic_certified}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="organic_certified">Organic Certified</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage_conditions">Storage Conditions</Label>
                <Textarea
                  id="storage_conditions"
                  name="storage_conditions"
                  value={formData.storage_conditions}
                  onChange={handleInputChange}
                  placeholder="Describe storage conditions, temperature, humidity, etc."
                  rows={2}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-emerald-900">Pricing (USD per unit)</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minimum_price">Minimum Price</Label>
                  <Input
                    id="minimum_price"
                    name="minimum_price"
                    type="number"
                    step="0.01"
                    value={formData.minimum_price}
                    onChange={handleInputChange}
                    placeholder="45.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="starting_price">Starting Price</Label>
                  <Input
                    id="starting_price"
                    name="starting_price"
                    type="number"
                    step="0.01"
                    value={formData.starting_price}
                    onChange={handleInputChange}
                    placeholder="50.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyout_price">Buyout Price (Optional)</Label>
                  <Input
                    id="buyout_price"
                    name="buyout_price"
                    type="number"
                    step="0.01"
                    value={formData.buyout_price}
                    onChange={handleInputChange}
                    placeholder="65.00"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || images.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Registering Crop...
                </>
              ) : (
                "Register Crop"
              )}
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
