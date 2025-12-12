"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { 
  Plus, 
  Package, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Award, 
  Gavel, 
  Eye,
  Loader2,
  TrendingUp
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Crop } from "@/lib/types/database"

export default function MyCropsPage() {
  const { userRole, walletAddress, isAuthenticated } = useUser()
  const router = useRouter()
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (isAuthenticated && walletAddress) {
      fetchMyCrops()
    }
  }, [isAuthenticated, walletAddress])

  const fetchMyCrops = async () => {
    if (!walletAddress) return

    setLoading(true)
    try {
      const response = await fetch(`/api/crops/farmer/${walletAddress}`)
      if (response.ok) {
        const cropsData = await response.json()
        setCrops(cropsData)
      } else {
        throw new Error("Failed to fetch crops")
      }
    } catch (error) {
      console.error("Error fetching crops:", error)
      toast({
        title: "Error",
        description: "Failed to load your crops",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">Authentication Required</h1>
          <p className="text-emerald-700">Please connect your wallet to view your crops</p>
        </div>
      </div>
    )
  }

  if (userRole !== "farmer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">Access Denied</h1>
          <p className="text-emerald-700 mb-4">Switch to farmer role to manage crops</p>
          <Button onClick={() => router.push("/switch-role")} className="bg-emerald-600 hover:bg-emerald-700">
            Switch to Farmer Role
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case 'auction':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Live Auction</Badge>
      case 'sold':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Sold</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredCrops = crops.filter(crop => {
    if (activeTab === "all") return true
    if (activeTab === "active") return crop.status === "active"
    if (activeTab === "auction") return crop.status === "auction"
    if (activeTab === "sold") return crop.status === "sold"
    return true
  })

  const stats = {
    total: crops.length,
    active: crops.filter(c => c.status === "active").length,
    auction: crops.filter(c => c.status === "auction").length,
    sold: crops.filter(c => c.status === "sold").length,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-emerald-900">My Crops</h1>
            <p className="text-emerald-700 mt-2">Manage your crop listings and track performance</p>
          </div>
          <Button 
            onClick={() => router.push("/register-crop")} 
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Register New Crop
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600">Total Crops</p>
                  <p className="text-2xl font-bold text-emerald-900">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Active Listings</p>
                  <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Live Auctions</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.auction}</p>
                </div>
                <Gavel className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Sold</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.sold}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crops List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Crop Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
                <TabsTrigger value="auction">Auctions ({stats.auction})</TabsTrigger>
                <TabsTrigger value="sold">Sold ({stats.sold})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="ml-2 text-emerald-700">Loading your crops...</span>
                  </div>
                ) : filteredCrops.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌾</div>
                    <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                      {activeTab === "all" ? "No crops registered yet" : `No ${activeTab} crops`}
                    </h3>
                    <p className="text-emerald-700 mb-4">
                      {activeTab === "all" 
                        ? "Start by registering your first crop to reach buyers"
                        : `You don't have any ${activeTab} crops at the moment`
                      }
                    </p>
                    {activeTab === "all" && (
                      <Button 
                        onClick={() => router.push("/register-crop")} 
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Register Your First Crop
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCrops.map((crop) => (
                      <Card key={crop.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4">
                              {crop.images && crop.images.length > 0 ? (
                                <img
                                  src={crop.images[0]}
                                  alt={crop.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-2xl rounded-lg">
                                  🌾
                                </div>
                              )}
                              
                              <div>
                                <h3 className="text-xl font-bold text-emerald-900">{crop.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">{crop.crop_type}</Badge>
                                  {crop.variety && <Badge variant="outline">{crop.variety}</Badge>}
                                  {crop.organic_certified && (
                                    <Badge className="bg-green-500 hover:bg-green-600">
                                      <Award className="w-3 h-3 mr-1" />
                                      Organic
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {getStatusBadge(crop.status)}
                              {crop.current_auction && (
                                <div className="text-sm text-orange-600 mt-1">
                                  {crop.current_auction.total_bids} bids
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-emerald-600" />
                              <span>{crop.quantity} {crop.unit}</span>
                            </div>
                            
                            {crop.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <span>{crop.location}</span>
                              </div>
                            )}
                            
                            {crop.harvest_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                                <span>{new Date(crop.harvest_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-emerald-600" />
                              <span>
                                {crop.current_auction?.current_highest_bid 
                                  ? `$${crop.current_auction.current_highest_bid} (bid)`
                                  : crop.starting_price 
                                  ? `$${crop.starting_price}`
                                  : "Price not set"
                                }
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Link href={`/crop/${crop.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                            
                            {crop.status === "active" && (
                              <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50">
                                <Gavel className="w-4 h-4 mr-2" />
                                Start Auction
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
