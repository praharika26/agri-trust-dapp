import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/database'
import { supabase } from '@/lib/database'

interface ActivityItem {
  id: string
  type: 'auction_ended' | 'bid_received' | 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'crop_sold' | 'purchase_completed'
  title: string
  description: string
  amount?: number
  status?: string
  timestamp: string
  crop_title?: string
}

// GET /api/activity - Get recent activity for dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_address = searchParams.get('wallet_address')
    const type = searchParams.get('type') // 'farmer' or 'buyer'
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await UserService.findOrCreateUser(wallet_address)
    
    let activities: ActivityItem[] = []

    if (type === 'farmer') {
      // Farmer recent activity
      const [offersResult, bidsResult, ordersResult] = await Promise.all([
        // Recent offers received
        supabase
          .from('offers')
          .select(`
            id, status, total_amount, created_at,
            crop:crops!crop_id(id, title, farmer_id)
          `)
          .eq('crop.farmer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit),
        
        // Recent bids on farmer's auctions
        supabase
          .from('bids')
          .select(`
            id, amount, bid_time,
            auction:auctions!auction_id(
              id, status,
              crop:crops!crop_id(id, title, farmer_id)
            )
          `)
          .eq('auction.crop.farmer_id', user.id)
          .order('bid_time', { ascending: false })
          .limit(limit),
        
        // Recent orders/sales
        supabase
          .from('orders')
          .select(`
            id, total_amount, status, created_at,
            crop:crops!crop_id(id, title, farmer_id)
          `)
          .eq('crop.farmer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit)
      ])

      // Process offers
      if (offersResult.data) {
        offersResult.data.forEach(offer => {
          const crop = Array.isArray(offer.crop) ? offer.crop[0] : offer.crop
          const cropTitle = crop && typeof crop === 'object' && 'title' in crop ? crop.title : 'crop'
          activities.push({
            id: `offer-${offer.id}`,
            type: offer.status === 'accepted' ? 'offer_accepted' : 'offer_received',
            title: offer.status === 'accepted' ? 'Offer accepted' : 'New offer received',
            description: `Offer for ${cropTitle}`,
            amount: offer.total_amount,
            status: offer.status,
            timestamp: offer.created_at,
            crop_title: cropTitle
          })
        })
      }

      // Process bids
      if (bidsResult.data) {
        bidsResult.data.forEach(bid => {
          const auction = Array.isArray(bid.auction) ? bid.auction[0] : bid.auction
          const crop = auction && Array.isArray(auction.crop) ? auction.crop[0] : auction?.crop
          const cropTitle = crop && typeof crop === 'object' && 'title' in crop ? crop.title : 'crop'
          activities.push({
            id: `bid-${bid.id}`,
            type: 'bid_received',
            title: 'New bid received',
            description: `Bid on ${cropTitle}`,
            amount: bid.amount,
            status: auction?.status,
            timestamp: bid.bid_time,
            crop_title: cropTitle
          })
        })
      }

      // Process orders
      if (ordersResult.data) {
        ordersResult.data.forEach(order => {
          const crop = Array.isArray(order.crop) ? order.crop[0] : order.crop
          const cropTitle = crop && typeof crop === 'object' && 'title' in crop ? crop.title : 'Crop'
          activities.push({
            id: `order-${order.id}`,
            type: 'crop_sold',
            title: 'Crop sold',
            description: `${cropTitle} sold`,
            amount: order.total_amount,
            status: order.status,
            timestamp: order.created_at,
            crop_title: cropTitle
          })
        })
      }
    } else {
      // Buyer recent activity
      const [offersResult, ordersResult] = await Promise.all([
        // Recent offers sent
        supabase
          .from('offers')
          .select(`
            id, status, total_amount, created_at,
            crop:crops!crop_id(id, title)
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit),
        
        // Recent purchases
        supabase
          .from('orders')
          .select(`
            id, total_amount, status, created_at,
            crop:crops!crop_id(id, title)
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit)
      ])

      // Process offers
      if (offersResult.data) {
        offersResult.data.forEach(offer => {
          const crop = Array.isArray(offer.crop) ? offer.crop[0] : offer.crop
          const cropTitle = crop && typeof crop === 'object' && 'title' in crop ? crop.title : 'crop'
          let title = 'Offer sent'
          if (offer.status === 'accepted') title = 'Offer accepted'
          else if (offer.status === 'rejected') title = 'Offer rejected'

          activities.push({
            id: `offer-${offer.id}`,
            type: offer.status === 'accepted' ? 'offer_accepted' : 'offer_rejected',
            title,
            description: `Offer for ${cropTitle}`,
            amount: offer.total_amount,
            status: offer.status,
            timestamp: offer.created_at,
            crop_title: cropTitle
          })
        })
      }

      // Process purchases
      if (ordersResult.data) {
        ordersResult.data.forEach(order => {
          const crop = Array.isArray(order.crop) ? order.crop[0] : order.crop
          const cropTitle = crop && typeof crop === 'object' && 'title' in crop ? crop.title : 'crop'
          activities.push({
            id: `purchase-${order.id}`,
            type: 'purchase_completed',
            title: 'Purchase completed',
            description: `Purchased ${cropTitle}`,
            amount: order.total_amount,
            status: order.status,
            timestamp: order.created_at,
            crop_title: cropTitle
          })
        })
      }
    }

    // Sort all activities by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    activities = activities.slice(0, limit)

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}