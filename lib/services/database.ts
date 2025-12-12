import { supabase } from '@/lib/database'
import type {
  User,
  Crop,
  Auction,
  Bid,
  Order,
  Offer,
  CreateCropRequest,
  CreateAuctionRequest,
  PlaceBidRequest,
  CreateOfferRequest,
  CropFilters,
  PaginationParams,
  PaginatedResponse,
} from '@/lib/types/database'

// User operations
export class UserService {
  static async findOrCreateUser(walletAddress: string, email?: string): Promise<User> {
    // Check if user exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (existingUser && !selectError) {
      return existingUser
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        wallet_address: walletAddress,
        email: email || null,
        role: 'buyer'
      })
      .select()
      .single()

    if (insertError) throw insertError
    return newUser
  }

  static async updateUserRole(walletAddress: string, role: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  }
}

// Crop operations
export class CropService {
  static async createCrop(farmerId: string, cropData: CreateCropRequest): Promise<Crop> {
    const { data, error } = await supabase
      .from('crops')
      .insert({
        farmer_id: farmerId,
        title: cropData.title,
        description: cropData.description,
        crop_type: cropData.crop_type,
        variety: cropData.variety,
        quantity: cropData.quantity,
        unit: cropData.unit || 'kg',
        harvest_date: cropData.harvest_date,
        location: cropData.location,
        latitude: cropData.latitude,
        longitude: cropData.longitude,
        organic_certified: cropData.organic_certified || false,
        quality_grade: cropData.quality_grade,
        moisture_content: cropData.moisture_content,
        storage_conditions: cropData.storage_conditions,
        minimum_price: cropData.minimum_price,
        starting_price: cropData.starting_price,
        buyout_price: cropData.buyout_price,
        images: cropData.images || [],
        documents: cropData.documents || [],
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getCropById(id: string): Promise<Crop | null> {
    const { data, error } = await supabase
      .from('crops')
      .select(`
        *,
        farmer:users!farmer_id (
          id,
          wallet_address,
          email
        ),
        current_auction:auctions!crop_id (
          id,
          status,
          end_time,
          current_highest_bid,
          total_bids
        )
      `)
      .eq('id', id)
      .in('auctions.status', ['upcoming', 'active'])
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (!data) return null

    return {
      ...data,
      farmer: Array.isArray(data.farmer) ? data.farmer[0] : data.farmer,
      current_auction: Array.isArray(data.current_auction) ? data.current_auction[0] : data.current_auction,
    }
  }

  static async getCrops(
    filters: CropFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Crop>> {
    const { page = 1, limit = 12, sort_by = 'created_at', sort_order = 'desc' } = pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query
    let query = supabase
      .from('crops')
      .select(`
        *,
        farmer:users!farmer_id (
          id,
          wallet_address,
          email
        ),
        current_auction:auctions!crop_id (
          id,
          status,
          end_time,
          current_highest_bid,
          total_bids
        )
      `, { count: 'exact' })
      .eq('status', 'active')

    // Apply filters
    if (filters.crop_type) {
      query = query.eq('crop_type', filters.crop_type)
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }

    if (filters.organic_certified !== undefined) {
      query = query.eq('organic_certified', filters.organic_certified)
    }

    if (filters.min_price) {
      query = query.gte('starting_price', filters.min_price)
    }

    if (filters.max_price) {
      query = query.lte('starting_price', filters.max_price)
    }

    if (filters.farmer_id) {
      query = query.eq('farmer_id', filters.farmer_id)
    }

    // Apply sorting and pagination
    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    const crops = (data || []).map(crop => ({
      ...crop,
      farmer: Array.isArray(crop.farmer) ? crop.farmer[0] : crop.farmer,
      current_auction: Array.isArray(crop.current_auction) ? crop.current_auction[0] : crop.current_auction,
    }))

    return {
      data: crops,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_next: to < (count || 0) - 1,
        has_prev: page > 1,
      },
    }
  }

  static async getFarmerCrops(farmerId: string): Promise<Crop[]> {
    const { data, error } = await supabase
      .from('crops')
      .select(`
        *,
        current_auction:auctions!crop_id (
          id,
          status,
          current_highest_bid,
          total_bids
        )
      `)
      .eq('farmer_id', farmerId)
      .in('auctions.status', ['upcoming', 'active'])
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(crop => ({
      ...crop,
      current_auction: Array.isArray(crop.current_auction) ? crop.current_auction[0] : crop.current_auction,
    }))
  }
}

// Auction operations
export class AuctionService {
  static async createAuction(auctionData: CreateAuctionRequest): Promise<Auction> {
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + auctionData.duration_hours * 60 * 60 * 1000)

    return await transaction(async (client) => {
      // Create auction
      const auctionResult = await client.query(
        `INSERT INTO auctions (
          crop_id, starting_price, reserve_price, bid_increment, start_time, end_time, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          auctionData.crop_id,
          auctionData.starting_price,
          auctionData.reserve_price,
          auctionData.bid_increment || 10,
          startTime,
          endTime,
          'active'
        ]
      )

      // Update crop status
      await client.query(
        'UPDATE crops SET status = $1, auction_start_date = $2, auction_end_date = $3 WHERE id = $4',
        ['auction', startTime, endTime, auctionData.crop_id]
      )

      return auctionResult.rows[0]
    })
  }

  static async placeBid(bidData: PlaceBidRequest, bidderId: string): Promise<Bid> {
    return await transaction(async (client) => {
      // Get current auction
      const auctionResult = await client.query(
        'SELECT * FROM auctions WHERE id = $1 AND status = $2',
        [bidData.auction_id, 'active']
      )

      if (auctionResult.rows.length === 0) {
        throw new Error('Auction not found or not active')
      }

      const auction = auctionResult.rows[0]

      // Validate bid amount
      const minBid = auction.current_highest_bid 
        ? auction.current_highest_bid + auction.bid_increment
        : auction.starting_price

      if (bidData.amount < minBid) {
        throw new Error(`Bid must be at least ${minBid}`)
      }

      // Mark previous winning bid as not winning
      if (auction.highest_bidder_id) {
        await client.query(
          'UPDATE bids SET is_winning = false WHERE auction_id = $1 AND is_winning = true',
          [bidData.auction_id]
        )
      }

      // Create new bid
      const bidResult = await client.query(
        `INSERT INTO bids (auction_id, bidder_id, amount, is_winning, transaction_hash)
         VALUES ($1, $2, $3, true, $4) RETURNING *`,
        [bidData.auction_id, bidderId, bidData.amount, bidData.transaction_hash]
      )

      // Update auction
      await client.query(
        `UPDATE auctions SET 
         current_highest_bid = $1, 
         highest_bidder_id = $2, 
         total_bids = total_bids + 1,
         updated_at = NOW()
         WHERE id = $3`,
        [bidData.amount, bidderId, bidData.auction_id]
      )

      return bidResult.rows[0]
    })
  }

  static async getAuctionById(id: string): Promise<Auction | null> {
    const result = await query(
      `SELECT a.*, c.title as crop_title, c.description as crop_description,
              u.wallet_address as highest_bidder_wallet
       FROM auctions a
       LEFT JOIN crops c ON a.crop_id = c.id
       LEFT JOIN users u ON a.highest_bidder_id = u.id
       WHERE a.id = $1`,
      [id]
    )

    if (result.rows.length === 0) return null

    const auction = result.rows[0]
    return {
      ...auction,
      crop: auction.crop_title ? {
        id: auction.crop_id,
        title: auction.crop_title,
        description: auction.crop_description,
      } : undefined,
      highest_bidder: auction.highest_bidder_wallet ? {
        id: auction.highest_bidder_id,
        wallet_address: auction.highest_bidder_wallet,
      } : undefined,
    }
  }

  static async getAuctionBids(auctionId: string): Promise<Bid[]> {
    const result = await query(
      `SELECT b.*, u.wallet_address as bidder_wallet
       FROM bids b
       LEFT JOIN users u ON b.bidder_id = u.id
       WHERE b.auction_id = $1
       ORDER BY b.amount DESC, b.bid_time ASC`,
      [auctionId]
    )

    return result.rows.map(row => ({
      ...row,
      bidder: {
        id: row.bidder_id,
        wallet_address: row.bidder_wallet,
      },
    }))
  }
}

// Offer operations
export class OfferService {
  static async createOffer(buyerId: string, offerData: CreateOfferRequest): Promise<Offer> {
    const expiresAt = offerData.expires_in_hours 
      ? new Date(Date.now() + offerData.expires_in_hours * 60 * 60 * 1000)
      : null

    const result = await query(
      `INSERT INTO offers (crop_id, buyer_id, quantity, price_per_unit, total_amount, message, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        offerData.crop_id,
        buyerId,
        offerData.quantity,
        offerData.price_per_unit,
        offerData.quantity * offerData.price_per_unit,
        offerData.message,
        expiresAt
      ]
    )

    return result.rows[0]
  }

  static async getCropOffers(cropId: string): Promise<Offer[]> {
    const result = await query(
      `SELECT o.*, u.wallet_address as buyer_wallet, u.email as buyer_email
       FROM offers o
       LEFT JOIN users u ON o.buyer_id = u.id
       WHERE o.crop_id = $1 AND o.status = 'pending'
       ORDER BY o.total_amount DESC, o.created_at DESC`,
      [cropId]
    )

    return result.rows.map(row => ({
      ...row,
      buyer: {
        id: row.buyer_id,
        wallet_address: row.buyer_wallet,
        email: row.buyer_email,
      },
    }))
  }

  static async updateOfferStatus(offerId: string, status: string): Promise<Offer> {
    const result = await query(
      'UPDATE offers SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, offerId]
    )
    return result.rows[0]
  }
}