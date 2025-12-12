"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/context/user-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Search, Filter, MapPin, Calendar, Award, Loader2 } from "lucide-react"
import type { Crop, PaginatedResponse } from "@/lib/types/database"

export default function MarketplacePage() {
  const { userRole, isAuthenticated } = useUser()
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    crop_type: "",
    location: "",
    organic_certified: "",
    min_price: "",
    max_price: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    total_pages: 0,
  })

  useEffect(() => {
    fetchCrops()
  }, [filters, pagination.page])

  const fetchCrops = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      })

      const response = await fetch(`/api/crops?${params}`)
      const data: PaginatedResponse<Crop> = await response.json()
      
      setCrops(data.data || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        total_pages: data.pagination.total_pages,
      }))
    } catch (error) {
      console.error("Failed to fetch crops:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, location: searchTerm }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">Authentication Required</h1>
          <p className="text-emerald-700">Please connect your wallet to access the marketplace</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Marketplace</h1>
          <p className="text-emerald-700">Discover fresh crops from verified farmers</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-emerald-200">
          <div className="grid md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            {/* Crop Type Filter */}
            <Select value={filters.crop_type} onValueChange={(value) => handleFilterChange('crop_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Crop Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="wheat">Wheat</SelectItem>
                <SelectItem value="rice">Rice</SelectItem>
                <SelectItem value="corn">Corn</SelectItem>
                <SelectItem value="barley">Barley</SelectItem>
                <SelectItem value="soybean">Soybean</SelectItem>
                <SelectItem value="cotton">Cotton</SelectItem>
                <SelectItem value="tomato">Tomato</SelectItem>
                <SelectItem value="potato">Potato</SelectItem>
                <SelectItem value="onion">Onion</SelectItem>
              </SelectContent>
            </Select>

            {/* Organic Filter */}
            <Select value={filters.organic_certified} onValueChange={(value) => handleFilterChange('organic_certified', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Certification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Organic Certified</SelectItem>
                <SelectItem value="false">Conventional</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Input
              placeholder="Min Price"
              type="number"
              value={filters.min_price}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
            />
            <Input
              placeholder="Max Price"
              type="number"
              value={filters.max_price}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-emerald-700">Loading crops...</span>
          </div>
        ) : crops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-emerald-200">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-xl font-semibold text-emerald-900 mb-2">No crops found</h3>
            <p className="text-emerald-700">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-emerald-700">
                Showing {crops.length} of {pagination.total} crops
              </p>
            </div>

            {/* Crop Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {crops.map((crop) => (
                <Link key={crop.id} href={`/crop/${crop.id}`}>
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-emerald-200 hover:border-emerald-400">
                    <CardHeader className="p-0">
                      <div className="relative">
                        {crop.images && crop.images.length > 0 ? (
                          <img
                            src={crop.images[0]}
                            alt={crop.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-4xl rounded-t-lg">
                            🌾
                          </div>
                        )}
                        
                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 flex gap-2">
                          {crop.organic_certified && (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <Award className="w-3 h-3 mr-1" />
                              Organic
                            </Badge>
                          )}
                          {crop.status === 'auction' && (
                            <Badge className="bg-orange-500 hover:bg-orange-600">
                              Live Auction
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg text-emerald-900 mb-2 line-clamp-1">
                        {crop.title}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-emerald-700">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{crop.crop_type}</span>
                          {crop.variety && <span>• {crop.variety}</span>}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span>{crop.quantity} {crop.unit}</span>
                          {crop.quality_grade && (
                            <Badge variant="outline" className="text-xs">
                              Grade {crop.quality_grade}
                            </Badge>
                          )}
                        </div>

                        {crop.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{crop.location}</span>
                          </div>
                        )}

                        {crop.harvest_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">
                              Harvested {new Date(crop.harvest_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <div className="w-full flex justify-between items-center">
                        <div>
                          {crop.starting_price && (
                            <div className="text-lg font-bold text-emerald-600">
                              ${crop.starting_price}
                            </div>
                          )}
                          {crop.buyout_price && (
                            <div className="text-xs text-gray-500">
                              Buy now: ${crop.buyout_price}
                            </div>
                          )}
                        </div>
                        
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                          {crop.status === 'auction' ? 'Join Auction' : 'View Details'}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                
                <span className="flex items-center px-4 text-emerald-700">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.total_pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
