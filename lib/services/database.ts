import { query, transaction } from '@/lib/database'
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
    const existingUser = await query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [walletAddress]
    )

    if (existingUser.rows.length > 0) {
      return existingUser.rows[0]
    }

    const newUser = await query(
      `INSERT INTO users (wallet_address, email) 
       VALUES ($1, $2) 
       RETURNING *`,
      [walletAddress, email]
    )

    return newUser.rows[0]
  }

  static async updateUserRole(walletAddress: string, role: string): Promise<User> {
    const result = await query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE wallet_address = $2 RETURNING *',
      [role, walletAddress]
    )
    return result.rows[0]
  }

  static async getUserById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id])
    return result.rows[0] || null
  }
}

// Crop operations
export class CropService {
  static async createCrop(farmerId: string, cropData: CreateCropRequest): Promise<Crop> {
    const result = await query(
      `INSERT INTO crops (
        farmer_id, title, description, crop_type, variety, quantity, unit,
        harvest_date, location, latitude, longitude, organic_certified,
        quality_grade, moisture_content, storage_conditions, minimum_price,
        starting_price, buyout_price, images, documents, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING *`,
      [
        farmerId,
        cropData.title,
        cropData.description,
        cropData.crop_type,
        cropData.variety,
        cropData.quantity,
        cropData.unit || 'kg',
        cropData.harvest_date,
        cropData.location,
        cropData.latitude,
        cropData.longitude,
        cropData.organic_certified || false,
        cropData.quality_grade,
        cropData.moisture_content,
        cropData.storage_conditions,
        cropData.minimum_price,
        cropData.starting_price,
        cropData.buyout_price,
        JSON.stringify(cropData.images || []),
        JSON.stringify(cropData.documents || []),
        'active'
      ]
    )
    return result.rows[0]
  }

  static async getCropById(id: string): Promise<Crop | null> {
    const result = await query(
      `SELECT c.*, u.wallet_address as farmer_wallet, u.email as farmer_email,
              a.id as auction_id, a.status as auction_status, a.end_time as auction_end_time,
              a.current_highest_bid, a.total_bids
       FROM crops c
       LEFT JOIN users u ON c.farmer_id = u.id
       LEFT JOIN auctions a ON c.id = a.crop_id AND a.status IN ('upcoming', 'active')
       WHERE c.id = $1`,
      [id]
    )

    if (result.rows.length === 0) return null

    const crop = result.rows[0]
    return {
      ...crop,
      images: crop.images ? JSON.parse(crop.images) : [],
      documents: crop.documents ? JSON.parse(crop.documents) : [],
      farmer: {
        id: crop.farmer_id,
        wallet_address: crop.farmer_wallet,
        email: crop.farmer_email,
      },
      current_auction: crop.auction_id ? {
        id: crop.auction_id,
        status: crop.auction_status,
        end_time: crop.auction_end_time,
        current_highest_bid: crop.current_highest_bid,
        total_bids: crop.total_bids,
      } : undefined,
    }
  }

  static async getCrops(
    filters: CropFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Crop>> {
    const { page = 1, limit = 12, sort_by = 'created_at', sort_order = 'desc' } = pagination
    const offset = (page - 1) * limit

    let whereClause = 'WHERE c.status = $1'
    let params: any[] = ['active']
    let paramCount = 1

    // Apply filters
    if (filters.crop_type) {
      paramCount++
      whereClause += ` AND c.crop_type = $${paramCount}`
      params.push(filters.crop_type)
    }

    if (filters.location) {
      paramCount++
      whereClause += ` AND c.location ILIKE $${paramCount}`
      params.push(`%${filters.location}%`)
    }

    if (filters.organic_certified !== undefined) {
      paramCount++
      whereClause += ` AND c.organic_certified = $${paramCount}`
      params.push(filters.organic_certified)
    }

    if (filters.min_price) {
      paramCount++
      whereClause += ` AND c.starting_price >= $${paramCount}`
      params.push(filters.min_price)
    }

    if (filters.max_price) {
      paramCount++
      whereClause += ` AND c.starting_price <= $${paramCount}`
      params.push(filters.max_price)
    }

    if (filters.farmer_id) {
      paramCount++
      whereClause += ` AND c.farmer_id = $${paramCount}`
      params.push(filters.farmer_id)
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM crops c ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].count)

    // Get paginated results
    const dataResult = await query(
      `SELECT c.*, u.wallet_address as farmer_wallet, u.email as farmer_email,
              a.id as auction_id, a.status as auction_status, a.end_time as auction_end_time,
              a.current_highest_bid, a.total_bids
       FROM crops c
       LEFT JOIN users u ON c.farmer_id = u.id
       LEFT JOIN auctions a ON c.id = a.crop_id AND a.status IN ('upcoming', 'active')
       ${whereClause}
       ORDER BY c.${sort_by} ${sort_order.toUpperCase()}
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    )

    const crops = dataResult.rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      documents: row.documents ? JSON.parse(row.documents) : [],
      farmer: {
        id: row.farmer_id,
        wallet_address: row.farmer_wallet,
        email: row.farmer_email,
      },
      current_auction: row.auction_id ? {
        id: row.auction_id,
        status: row.auction_status,
        end_time: row.auction_end_time,
        current_highest_bid: row.current_highest_bid,
        total_bids: row.total_bids,
      } : undefined,
    }))

    return {
      data: crops,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
        has_prev: page > 1,
      },
    }
  }

  static async getFarmerCrops(farmerId: string): Promise<Crop[]> {
    const result = await query(
      `SELECT c.*, a.id as auction_id, a.status as auction_status, 
              a.current_highest_bid, a.total_bids
       FROM crops c
       LEFT JOIN auctions a ON c.id = a.crop_id AND a.status IN ('upcoming', 'active')
       WHERE c.farmer_id = $1
       ORDER BY c.created_at DESC`,
      [farmerId]
    )

    return result.rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      documents: row.documents ? JSON.parse(row.documents) : [],
      current_auction: row.auction_id ? {
        id: row.auction_id,
        status: row.auction_status,
        current_highest_bid: row.current_highest_bid,
        total_bids: row.total_bids,
      } : undefined,
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