"use client"

import { useEffect, useState, use } from "react"
import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, 
  Calendar, 
  Award, 
  Package, 
  Droplets,
  Gavel,
  DollarSign,
  User,
  MessageSquare,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuctionBidding } from "@/lib/hooks/useAuctionBidding"
import type { Crop, Auction, Bid, Offer } from "@/lib/types/database"

interface CropPageProps {
  params: Promise<{ id: string }>
}

export default function CropPage({ params }: CropPageProps) {
  const resolvedParams = use(params)
  const { userRole, walletAddress, isAuthenticated } = useUser()
  const router = useRouter()
  const { 
    loading: auctionLoading, 
    error: auctionError, 
    createAuction: createBlockchainAuction, 
    placeBid: placeBlockchainBid,
    clearError: clearAuctionError
  } = useAuctionBidding()
  const [crop, setCrop] = useState<Crop | null>(null)
  const [auction, setAuction] = useState<Auction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState("")
  const [offerData, setOfferData] = useState({
    quantity: "",
    price_per_unit: "",
    message: "",
  })
  const [auctionData, setAuctionData] = useState({
    starting_price: "",
    reserve_price: "",
    duration_hours: "24",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCropDetails()
  }, [resolvedParams.id])

  const fetchCropDetails = async () => {
    try {
      const response = await fetch(`/api/crops/${resolvedParams.id}`)
      if (response.ok) {
        const cropData = await response.json()
        setCrop(cropData)
        
        if (cropData.current_auction) {
          await fetchAuctionDetails(cropData.current_auction.id)
        }
        
        await fetchOffers()
      } else {
        toast({
          title: "Crop not found",
          description: "The requested crop could not be found",
          variant: "destructive",
        })
        router.push("/marketplace")
      }
    } catch (error) {
      console.error("Error fetching crop:", error)
      toast({
        title: "Error",
        description: "Failed to load crop details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAuctionDetails = async (auctionId: string) => {
    try {
      const [auctionResponse, bidsResponse] = await Promise.all([
        fetch(`/api/auctions/${auctionId}`),
        fetch(`/api/auctions/${auctionId}/bids`)
      ])
      
      if (auctionResponse.ok) {
        const auctionData = await auctionResponse.json()
        setAuction(auctionData)
      }
      
      if (bidsResponse.ok) {
        const bidsData = await bidsResponse.json()
        setBids(bidsData)
      }
    } catch (error) {
      console.error("Error fetching auction details:", error)
    }
  }

  const fetchOffers = async () => {
    try {
      const response = await fetch(`/api/offers/crop/${resolvedParams.id}`)
      if (response.ok) {
        const offersData = await response.json()
        setOffers(offersData)
      }
    } catch (error) {
      console.error("Error fetching offers:", error)
    }
  }

  // Enhanced bid function with blockchain transaction signing
  const handlePlaceBid = async () => {
    if (!walletAddress || !bidAmount || !auction) return

    setSubmitting(true)
    clearAuctionError()
    
    try {
      toast({
        title: "Signing transaction...",
        description: "Please confirm the bid transaction in your wallet",
      })

      const blockchainResult = await placeBlockchainBid({
        auctionId: auction.id,
        bidAmount: parseFloat(bidAmount)
      })

      if (!blockchainResult.success) {
        throw new Error("Blockchain transaction failed")
      }

      const response = await fetch(`/api/auctions/${auction.id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: walletAddress,
          amount: parseFloat(bidAmount),
          transaction_hash: blockchainResult.transactionHash,
        }),
      })

      if (response.ok) {
        toast({
          title: "Bid placed successfully!",
          description: `Your bid of $${bidAmount} has been placed and recorded on the blockchain.`,
        })
        setBidAmount("")
        await fetchAuctionDetails(auction.id)
      } else {
        const error = await response.json()
        toast({
          title: "Bid placed on blockchain",
          description: `Your bid was recorded on blockchain but database update failed: ${error.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error placing bid:", error)
      toast({
        title: "Failed to place bid",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Enhanced auction creation with blockchain transaction signing
  const handleCreateAuction = async () => {
    if (!walletAddress || !auctionData.starting_price || !auctionData.duration_hours || !crop) return

    setSubmitting(true)
    clearAuctionError()
    
    try {
      toast({
        title: "Creating auction...",
        description: "Please confirm the auction creation transaction in your wallet",
      })

      // Use mock numeric tokenId for testing (skip NFT check)
      // Convert UUID to a simple numeric hash for blockchain compatibility
      const tokenId = Math.abs(crop.id.split('-')[0].split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)).toString()

      const blockchainResult = await createBlockchainAuction({
        tokenId: tokenId,
        startingPrice: parseFloat(auctionData.starting_price),
        reservePrice: auctionData.reserve_price ? parseFloat(auctionData.reserve_price) : undefined,
        bidIncrement: 10,
        durationHours: parseInt(auctionData.duration_hours)
      })

      if (!blockchainResult.success) {
        throw new Error("Blockchain transaction failed")
      }

      const response = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: walletAddress,
          auction_data: {
            crop_id: resolvedParams.id,
            starting_price: parseFloat(auctionData.starting_price),
            reserve_price: auctionData.reserve_price ? parseFloat(auctionData.reserve_price) : undefined,
            duration_hours: parseInt(auctionData.duration_hours),
            transaction_hash: blockchainResult.transactionHash,
            blockchain_auction_id: blockchainResult.auctionId,
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Auction created successfully!",
          description: `Your crop auction is now live on the blockchain.`,
        })
        await fetchCropDetails()
      } else {
        const error = await response.json()
        toast({
          title: "Auction created on blockchain",
          description: `Your auction was created on blockchain but database update failed: ${error.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating auction:", error)
      toast({
        title: "Failed to create auction",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateOffer = async () => {
    if (!walletAddress || !offerData.quantity || !offerData.price_per_unit) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: walletAddress,
          offer_data: {
            crop_id: resolvedParams.id,
            quantity: parseFloat(offerData.quantity),
            price_per_unit: parseFloat(offerData.price_per_unit),
            message: offerData.message,
            expires_in_hours: 72,
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Offer submitted!",
          description: "Your offer has been sent to the farmer",
        })
        setOfferData({ quantity: "", price_per_unit: "", message: "" })
        await fetchOffers()
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error) {
      toast({
        title: "Failed to create offer",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-emerald-700">Loading crop details...</span>
        </div>
      </div>
    )
  }

  if (!crop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">Crop Not Found</h1>
          <Button onClick={() => router.push("/marketplace")} className="bg-emerald-600 hover:bg-emerald-700">
            Back to Marketplace
          </Button>
        </div>
      </div>
    )
  }

  const isOwner = crop.farmer?.wallet_address === walletAddress
  const canBid = userRole === "user" && !isOwner && crop.status === "auction"
  const canOffer = userRole === "user" && !isOwner && crop.status === "active"
  const canCreateAuction = isOwner && crop.status === "active"

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-emerald-700 hover:text-emerald-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                {crop.images && crop.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                    {crop.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${crop.title} ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-6xl">
                    🌾
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-emerald-900">{crop.title}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{crop.crop_type}</Badge>
                      {crop.variety && <Badge variant="outline">{crop.variety}</Badge>}
                      {crop.organic_certified && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <Award className="w-3 h-3 mr-1" />
                          Organic
                        </Badge>
                      )}
                      {crop.quality_grade && (
                        <Badge variant="outline">Grade {crop.quality_grade}</Badge>
                      )}
                    </div>
                  </div>
                  <Badge 
                    className={
                      crop.status === 'auction' ? 'bg-orange-500 hover:bg-orange-600' :
                      crop.status === 'active' ? 'bg-green-500 hover:bg-green-600' :
                      'bg-gray-500 hover:bg-gray-600'
                    }
                  >
                    {crop.status === 'auction' ? 'Live Auction' : 
                     crop.status === 'active' ? 'Available' : 
                     crop.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-emerald-700 mb-4">{crop.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
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
                      <span>Harvested {new Date(crop.harvest_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {crop.moisture_content && (
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-emerald-600" />
                      <span>{crop.moisture_content}% moisture</span>
                    </div>
                  )}
                </div>

                {crop.storage_conditions && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-emerald-900 mb-2">Storage Conditions</h4>
                    <p className="text-sm text-emerald-700">{crop.storage_conditions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Farmer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-mono text-emerald-600">
                    {crop.farmer?.wallet_address}
                  </p>
                  {crop.farmer?.email && (
                    <p className="text-emerald-700 mt-1">{crop.farmer.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {crop.starting_price && (
                    <div>
                      <span className="text-sm text-emerald-700">Starting Price</span>
                      <div className="text-2xl font-bold text-emerald-600">
                        ${crop.starting_price}
                      </div>
                    </div>
                  )}
                  
                  {crop.buyout_price && (
                    <div>
                      <span className="text-sm text-emerald-700">Buy Now Price</span>
                      <div className="text-xl font-semibold text-emerald-600">
                        ${crop.buyout_price}
                      </div>
                    </div>
                  )}
                  
                  {crop.minimum_price && (
                    <div>
                      <span className="text-sm text-emerald-700">Minimum Price</span>
                      <div className="text-lg text-emerald-600">
                        ${crop.minimum_price}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {crop.status === "auction" && auction && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="w-5 h-5" />
                    Live Auction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-emerald-700">Current Highest Bid</span>
                      <div className="text-2xl font-bold text-emerald-600">
                        ${auction.current_highest_bid || auction.starting_price}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-emerald-700">Total Bids</span>
                      <div className="text-lg">{auction.total_bids}</div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-emerald-700">Ends</span>
                      <div className="text-sm">{new Date(auction.end_time).toLocaleString()}</div>
                    </div>

                    {canBid && (
                      <div className="space-y-3">
                        <Separator />
                        <div>
                          <Label htmlFor="bidAmount">Your Bid ($)</Label>
                          <Input
                            id="bidAmount"
                            type="number"
                            step="0.01"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder={`Min: ${(auction.current_highest_bid || auction.starting_price) + auction.bid_increment}`}
                          />
                        </div>
                        <Button
                          onClick={handlePlaceBid}
                          disabled={submitting || !bidAmount || auctionLoading}
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          {submitting || auctionLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {auctionLoading ? "Signing..." : "Placing Bid..."}
                            </>
                          ) : (
                            "Place Bid"
                          )}
                        </Button>
                        {auctionError && (
                          <div className="text-sm text-red-600 mt-2">
                            {auctionError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canCreateAuction && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        <Gavel className="w-4 h-4 mr-2" />
                        Start Auction
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Auction</DialogTitle>
                        <DialogDescription>
                          Set up a blockchain auction for your crop
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="starting_price">Starting Price ($)</Label>
                          <Input
                            id="starting_price"
                            type="number"
                            step="0.01"
                            value={auctionData.starting_price}
                            onChange={(e) => setAuctionData(prev => ({ ...prev, starting_price: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="reserve_price">Reserve Price ($) - Optional</Label>
                          <Input
                            id="reserve_price"
                            type="number"
                            step="0.01"
                            value={auctionData.reserve_price}
                            onChange={(e) => setAuctionData(prev => ({ ...prev, reserve_price: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration_hours">Duration (hours)</Label>
                          <Input
                            id="duration_hours"
                            type="number"
                            value={auctionData.duration_hours}
                            onChange={(e) => setAuctionData(prev => ({ ...prev, duration_hours: e.target.value }))}
                          />
                        </div>
                        <Button
                          onClick={handleCreateAuction}
                          disabled={submitting || auctionLoading}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          {submitting || auctionLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {auctionLoading ? "Signing..." : "Creating..."}
                            </>
                          ) : (
                            "Create Auction"
                          )}
                        </Button>
                        {auctionError && (
                          <div className="text-sm text-red-600 mt-2">
                            {auctionError}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}



                {canOffer && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Make Offer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Make an Offer</DialogTitle>
                        <DialogDescription>
                          Submit a direct offer to the farmer
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="offer_quantity">Quantity ({crop.unit})</Label>
                          <Input
                            id="offer_quantity"
                            type="number"
                            step="0.01"
                            value={offerData.quantity}
                            onChange={(e) => setOfferData(prev => ({ ...prev, quantity: e.target.value }))}
                            placeholder={`Max: ${crop.quantity}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor="offer_price">Price per {crop.unit} ($)</Label>
                          <Input
                            id="offer_price"
                            type="number"
                            step="0.01"
                            value={offerData.price_per_unit}
                            onChange={(e) => setOfferData(prev => ({ ...prev, price_per_unit: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="offer_message">Message (Optional)</Label>
                          <Textarea
                            id="offer_message"
                            value={offerData.message}
                            onChange={(e) => setOfferData(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Add a message to your offer..."
                            rows={3}
                          />
                        </div>
                        {offerData.quantity && offerData.price_per_unit && (
                          <div className="p-3 bg-emerald-50 rounded-lg">
                            <div className="text-sm text-emerald-700">Total Offer</div>
                            <div className="text-lg font-bold text-emerald-600">
                              ${(parseFloat(offerData.quantity) * parseFloat(offerData.price_per_unit)).toFixed(2)}
                            </div>
                          </div>
                        )}
                        <Button
                          onClick={handleCreateOffer}
                          disabled={submitting || !offerData.quantity || !offerData.price_per_unit}
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Offer"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {crop.buyout_price && canOffer && (
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Buy Now - ${crop.buyout_price}
                  </Button>
                )}
              </CardContent>
            </Card>

            {bids.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bids</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bids.slice(0, 5).map((bid, index) => (
                      <div key={bid.id} className="flex justify-between items-center text-sm">
                        <span className="font-mono text-emerald-600">
                          {bid.bidder?.wallet_address?.slice(0, 6)}...{bid.bidder?.wallet_address?.slice(-4)}
                        </span>
                        <div className="text-right">
                          <div className="font-semibold">${bid.amount}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(bid.bid_time).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}