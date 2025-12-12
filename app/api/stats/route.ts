import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/database'
import { supabase } from '@/lib/database'

// GET /api/stats - Get user statistics for dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_address = searchParams.get('wallet_address')
    const type = searchParams.get('type') // 'farmer' or 'buyer'

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await UserService.findOrCreateUser(wallet_address)
    
    let stats = {}

    if (type === 'farmer') {
      // Farmer statistics
      const [cropsResult, offersResult, auctionsResult, ordersResult] = await Promise.all([
        // Active crops count
        supabase
          .from('crops')
          .select('id, status')
          .eq('farmer_id', user.id),
        
        // Offers received
        supabase
          .from('offers')
          .select('id, status, crop:crops!crop_id(farmer_id)')
          .eq('crop.farmer_id', user.id),
        
        // Auctions
        supabase
          .from('auctions')
          .select('id, status, crop:crops!crop_id(farmer_id)')
          .eq('crop.farmer_id', user.id),
        
        // Orders as seller
        supabase
          .from('orders')
          .select('id, total_amount, status, crop:crops!crop_id(farmer_id)')
          .eq('crop.farmer_id', user.id)
      ])

      const crops = cropsResult.data || []
      const offers = offersResult.data || []
      const auctions = auctionsResult.data || []
      const orders = ordersResult.data || []

      stats = {
        crops: {
          total: crops.length,
          active: crops.filter(c => c.status === 'active').length,
          auction: crops.filter(c => c.status === 'auction').length,
          sold: crops.filter(c => c.status === 'sold').length,
        },
        offers: {
          total: offers.length,
          pending: offers.filter(o => o.status === 'pending').length,
          accepted: offers.filter(o => o.status === 'accepted').length,
          rejected: offers.filter(o => o.status === 'rejected').length,
        },
        auctions: {
          total: auctions.length,
          active: auctions.filter(a => a.status === 'active').length,
          completed: auctions.filter(a => a.status === 'completed').length,
        },
        revenue: {
          total: orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + (o.total_amount || 0), 0),
          pending: orders
            .filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status))
            .reduce((sum, o) => sum + (o.total_amount || 0), 0),
        }
      }
    } else {
      // Buyer statistics
      const [bidsResult, offersResult, ordersResult] = await Promise.all([
        // Bids placed
        supabase
          .from('bids')
          .select('id, is_winning, auction:auctions!auction_id(id, status)')
          .eq('bidder_id', user.id),
        
        // Offers sent
        supabase
          .from('offers')
          .select('id, status')
          .eq('buyer_id', user.id),
        
        // Orders as buyer
        supabase
          .from('orders')
          .select('id, total_amount, status')
          .eq('buyer_id', user.id)
      ])

      const bids = bidsResult.data || []
      const offers = offersResult.data || []
      const orders = ordersResult.data || []

      stats = {
        bids: {
          total: bids.length,
          winning: bids.filter(b => {
            const auction = Array.isArray(b.auction) ? b.auction[0] : b.auction
            return b.is_winning && auction?.status === 'active'
          }).length,
          won: bids.filter(b => {
            const auction = Array.isArray(b.auction) ? b.auction[0] : b.auction
            return b.is_winning && auction?.status === 'completed'
          }).length,
          lost: bids.filter(b => {
            const auction = Array.isArray(b.auction) ? b.auction[0] : b.auction
            return !b.is_winning && auction?.status === 'completed'
          }).length,
        },
        offers: {
          total: offers.length,
          pending: offers.filter(o => o.status === 'pending').length,
          accepted: offers.filter(o => o.status === 'accepted').length,
          rejected: offers.filter(o => o.status === 'rejected').length,
        },
        purchases: {
          total: orders.length,
          completed: orders.filter(o => o.status === 'delivered').length,
          pending: orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length,
        },
        spending: {
          total: orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + (o.total_amount || 0), 0),
          pending: orders
            .filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status))
            .reduce((sum, o) => sum + (o.total_amount || 0), 0),
        }
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}