import { supabase } from '@/lib/database'
import { DateValidator } from '@/lib/validation/date-validator'
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

// Enhanced interface for sanitized crop data
interface CropDataSanitized extends Omit<CreateCropRequest, 'harvest_date'> {
  harvest_date: string | null; // Properly typed as nullable after sanitization
}

// Crop operations
export class CropService {
  /**
   * Sanitizes crop data before database insertion, particularly date fields
   * @param cropData - Raw crop data from form submission
   * @returns Sanitized crop data with proper null handling for dates
   */
  static sanitizeCropData(cropData: CreateCropRequest): CropDataSanitized {
    // Sanitize harvest_date field using DateValidator
    const harvestDateResult = cropData.harvest_date 
      ? DateValidator.validateHarvestDate(cropData.harvest_date)
      : { isValid: true, sanitizedValue: null };

    // If date validation fails, throw an error with descriptive message
    if (!harvestDateResult.isValid) {
      throw new Error(harvestDateResult.error || 'Invalid harvest date format');
    }

    return {
      ...cropData,
      harvest_date: harvestDateResult.sanitizedValue,
    };
  }

  static async createCrop(farmerId: string, cropData: CreateCropRequest): Promise<Crop> {
    // Sanitize crop data before database insertion
    const sanitizedData = this.sanitizeCropData(cropData);

    // Build insert object with only existing database columns
    const insertData: any = {
      farmer_id: farmerId,
      title: sanitizedData.title,
      description: sanitizedData.description,
      crop_type: sanitizedData.crop_type,
      quantity: sanitizedData.quantity,
      unit: sanitizedData.unit || 'kg',
      organic_certified: sanitizedData.organic_certified || false,
      images: sanitizedData.images || [],
      documents: sanitizedData.documents || [],
      status: 'active'
    }

    // Add optional fields only if they exist and are supported by the database
    if (sanitizedData.variety !== undefined) insertData.variety = sanitizedData.variety
    // Use sanitized harvest_date (null for empty/invalid dates)
    if (sanitizedData.harvest_date !== undefined) insertData.harvest_date = sanitizedData.harvest_date
    if (sanitizedData.location !== undefined) insertData.location = sanitizedData.location
    if (sanitizedData.latitude !== undefined) insertData.latitude = sanitizedData.latitude
    if (sanitizedData.longitude !== undefined) insertData.longitude = sanitizedData.longitude
    if (sanitizedData.quality_grade !== undefined) insertData.quality_grade = sanitizedData.quality_grade
    if (sanitizedData.moisture_content !== undefined) insertData.moisture_content = sanitizedData.moisture_content
    if (sanitizedData.storage_conditions !== undefined) insertData.storage_conditions = sanitizedData.storage_conditions
    if (sanitizedData.minimum_price !== undefined) insertData.minimum_price = sanitizedData.minimum_price
    if (sanitizedData.starting_price !== undefined) insertData.starting_price = sanitizedData.starting_price
    if (sanitizedData.buyout_price !== undefined) insertData.buyout_price = sanitizedData.buyout_price
    if (sanitizedData.ipfs_hash !== undefined) insertData.ipfs_hash = sanitizedData.ipfs_hash

    // Note: NFT-related fields (nft_minted, nft_token_id, nft_metadata_url, nft_transaction_hash) 
    // are not available in the current database schema and will be ignored
    // The NFT information is handled separately or stored in IPFS metadata

    const { data, error } = await supabase
      .from('crops')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // Log error details for debugging as required by Requirements 2.4
      console.error('Database insertion error for crop:', {
        farmerId,
        cropData: sanitizedData,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
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
    const startTime = new Date().toISOString()
    const endTime = new Date(Date.now() + auctionData.duration_hours * 60 * 60 * 1000).toISOString()

    // Create auction
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .insert({
        crop_id: auctionData.crop_id,
        starting_price: auctionData.starting_price,
        reserve_price: auctionData.reserve_price,
        bid_increment: auctionData.bid_increment || 10,
        start_time: startTime,
        end_time: endTime,
        status: 'active'
      })
      .select()
      .single()

    if (auctionError) throw auctionError

    // Update crop status
    const { error: cropError } = await supabase
      .from('crops')
      .update({
        status: 'auction',
        auction_start_date: startTime,
        auction_end_date: endTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', auctionData.crop_id)

    if (cropError) throw cropError

    return auction
  }

  static async placeBid(bidData: PlaceBidRequest, bidderId: string): Promise<Bid> {
    // Get current auction
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', bidData.auction_id)
      .eq('status', 'active')
      .single()

    if (auctionError || !auction) {
      throw new Error('Auction not found or not active')
    }

    // Validate bid amount
    const minBid = auction.current_highest_bid 
      ? auction.current_highest_bid + auction.bid_increment
      : auction.starting_price

    if (bidData.amount < minBid) {
      throw new Error(`Bid must be at least ${minBid}`)
    }

    // Mark previous winning bid as not winning
    if (auction.highest_bidder_id) {
      await supabase
        .from('bids')
        .update({ is_winning: false })
        .eq('auction_id', bidData.auction_id)
        .eq('is_winning', true)
    }

    // Create new bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert({
        auction_id: bidData.auction_id,
        bidder_id: bidderId,
        amount: bidData.amount,
        is_winning: true,
        transaction_hash: bidData.transaction_hash
      })
      .select()
      .single()

    if (bidError) throw bidError

    // Update auction
    const { error: updateError } = await supabase
      .from('auctions')
      .update({
        current_highest_bid: bidData.amount,
        highest_bidder_id: bidderId,
        total_bids: (auction.total_bids || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', bidData.auction_id)

    if (updateError) throw updateError

    return bid
  }

  static async getAuctionById(id: string): Promise<Auction | null> {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        crop:crops!crop_id (
          id,
          title,
          description
        ),
        highest_bidder:users!highest_bidder_id (
          id,
          wallet_address
        )
      `)
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (!data) return null

    return {
      ...data,
      crop: Array.isArray(data.crop) ? data.crop[0] : data.crop,
      highest_bidder: Array.isArray(data.highest_bidder) ? data.highest_bidder[0] : data.highest_bidder,
    }
  }

  static async getAuctionBids(auctionId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        bidder:users!bidder_id (
          id,
          wallet_address
        )
      `)
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })
      .order('bid_time', { ascending: true })

    if (error) throw error

    return (data || []).map(bid => ({
      ...bid,
      bidder: Array.isArray(bid.bidder) ? bid.bidder[0] : bid.bidder,
    }))
  }

  static async getAuctions(
    filters: { status?: string } = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Auction>> {
    const { page = 1, limit = 12, sort_by = 'created_at', sort_order = 'desc' } = pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query
    let query = supabase
      .from('auctions')
      .select(`
        *,
        crop:crops!crop_id (
          id,
          title,
          description,
          crop_type,
          quantity,
          unit,
          images,
          farmer:users!farmer_id (
            id,
            wallet_address,
            email
          )
        ),
        highest_bidder:users!highest_bidder_id (
          id,
          wallet_address
        )
      `, { count: 'exact' })

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    // Apply sorting and pagination
    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    const auctions = (data || []).map(auction => ({
      ...auction,
      crop: {
        ...Array.isArray(auction.crop) ? auction.crop[0] : auction.crop,
        farmer: Array.isArray(auction.crop?.farmer) ? auction.crop.farmer[0] : auction.crop?.farmer,
      },
      highest_bidder: Array.isArray(auction.highest_bidder) ? auction.highest_bidder[0] : auction.highest_bidder,
    }))

    return {
      data: auctions,
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

  static async getUserBids(userId: string): Promise<Bid[]> {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        auction:auctions!auction_id (
          id,
          status,
          end_time,
          starting_price,
          current_highest_bid,
          crop:crops!crop_id (
            id,
            title,
            crop_type,
            quantity,
            unit,
            farmer:users!farmer_id (
              id,
              wallet_address,
              email
            )
          )
        )
      `)
      .eq('bidder_id', userId)
      .order('bid_time', { ascending: false })

    if (error) throw error

    return (data || []).map(bid => ({
      ...bid,
      auction: {
        ...Array.isArray(bid.auction) ? bid.auction[0] : bid.auction,
        crop: {
          ...Array.isArray(bid.auction?.crop) ? bid.auction.crop[0] : bid.auction?.crop,
          farmer: Array.isArray(bid.auction?.crop?.farmer) ? bid.auction.crop.farmer[0] : bid.auction?.crop?.farmer,
        },
      },
    }))
  }
}

// Offer operations
export class OfferService {
  static async createOffer(buyerId: string, offerData: CreateOfferRequest): Promise<Offer> {
    const expiresAt = offerData.expires_in_hours 
      ? new Date(Date.now() + offerData.expires_in_hours * 60 * 60 * 1000).toISOString()
      : null

    const { data, error } = await supabase
      .from('offers')
      .insert({
        crop_id: offerData.crop_id,
        buyer_id: buyerId,
        quantity: offerData.quantity,
        price_per_unit: offerData.price_per_unit,
        total_amount: offerData.quantity * offerData.price_per_unit,
        message: offerData.message,
        expires_at: expiresAt
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getCropOffers(cropId: string): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        buyer:users!buyer_id (
          id,
          wallet_address,
          email
        )
      `)
      .eq('crop_id', cropId)
      .eq('status', 'pending')
      .order('total_amount', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(offer => ({
      ...offer,
      buyer: Array.isArray(offer.buyer) ? offer.buyer[0] : offer.buyer,
    }))
  }

  static async updateOfferStatus(offerId: string, status: string): Promise<Offer> {
    const { data, error } = await supabase
      .from('offers')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', offerId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getFarmerOffers(farmerId: string): Promise<Offer[]> {
    // First get the farmer's crop IDs
    const { data: crops, error: cropsError } = await supabase
      .from('crops')
      .select('id')
      .eq('farmer_id', farmerId)

    if (cropsError) throw cropsError
    
    const cropIds = crops?.map(crop => crop.id) || []
    
    if (cropIds.length === 0) {
      return []
    }

    // Then get offers for those crops
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        buyer:users!buyer_id (
          id,
          wallet_address,
          email
        ),
        crop:crops!crop_id (
          id,
          title,
          farmer_id
        )
      `)
      .in('crop_id', cropIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(offer => ({
      ...offer,
      buyer: Array.isArray(offer.buyer) ? offer.buyer[0] : offer.buyer,
      crop: Array.isArray(offer.crop) ? offer.crop[0] : offer.crop,
    }))
  }

  static async getBuyerOffers(buyerId: string): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        crop:crops!crop_id (
          id,
          title,
          farmer:users!farmer_id (
            id,
            wallet_address,
            email
          )
        )
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(offer => ({
      ...offer,
      crop: {
        ...Array.isArray(offer.crop) ? offer.crop[0] : offer.crop,
        farmer: Array.isArray(offer.crop?.farmer) ? offer.crop.farmer[0] : offer.crop?.farmer,
      },
    }))
  }
}

// Order operations
export class OrderService {
  static async createOrder(orderData: {
    crop_id: string;
    buyer_id: string;
    quantity: number;
    price_per_unit: number;
    order_type?: string;
    transaction_hash?: string;
  }): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        total_amount: orderData.quantity * orderData.price_per_unit,
        status: 'pending',
        order_type: orderData.order_type || 'direct_purchase'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        crop:crops!crop_id (
          id,
          title,
          crop_type,
          quantity,
          unit,
          images,
          farmer:users!farmer_id (
            id,
            wallet_address,
            email
          )
        ),
        buyer:users!buyer_id (
          id,
          wallet_address,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (!data) return null

    return {
      ...data,
      crop: {
        ...Array.isArray(data.crop) ? data.crop[0] : data.crop,
        farmer: Array.isArray(data.crop?.farmer) ? data.crop.farmer[0] : data.crop?.farmer,
      },
      buyer: Array.isArray(data.buyer) ? data.buyer[0] : data.buyer,
    }
  }

  static async getUserOrders(userId: string, type: 'buyer' | 'seller' = 'buyer'): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select(`
        *,
        crop:crops!crop_id (
          id,
          title,
          crop_type,
          quantity,
          unit,
          images,
          farmer:users!farmer_id (
            id,
            wallet_address,
            email
          )
        ),
        buyer:users!buyer_id (
          id,
          wallet_address,
          email
        )
      `)

    if (type === 'seller') {
      // Get orders where user is the farmer (seller)
      query = query.eq('crop.farmer_id', userId)
    } else {
      // Get orders where user is the buyer
      query = query.eq('buyer_id', userId)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    return (data || []).map(order => ({
      ...order,
      crop: {
        ...Array.isArray(order.crop) ? order.crop[0] : order.crop,
        farmer: Array.isArray(order.crop?.farmer) ? order.crop.farmer[0] : order.crop?.farmer,
      },
      buyer: Array.isArray(order.buyer) ? order.buyer[0] : order.buyer,
    }))
  }

  static async updateOrderStatus(id: string, status: string, transactionHash?: string): Promise<Order> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (transactionHash) {
      updateData.transaction_hash = transactionHash
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}