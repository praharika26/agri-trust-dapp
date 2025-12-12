// Database types for AgriTrust

export interface User {
  id: string
  wallet_address: string
  email?: string
  role: 'farmer' | 'buyer' | 'both'
  profile_image_url?: string
  created_at: Date
  updated_at: Date
}

export interface Crop {
  id: string
  farmer_id: string
  title: string
  description: string
  crop_type: string
  variety?: string
  quantity: number
  unit: string
  harvest_date?: Date
  location?: string
  latitude?: number
  longitude?: number
  organic_certified: boolean
  quality_grade?: string
  moisture_content?: number
  storage_conditions?: string
  minimum_price?: number
  starting_price?: number
  buyout_price?: number
  status: 'draft' | 'active' | 'auction' | 'sold' | 'expired'
  auction_start_date?: Date
  auction_end_date?: Date
  images?: string[]
  documents?: any[]
  blockchain_id?: number
  ipfs_hash?: string
  nft_token_id?: number
  nft_metadata_url?: string
  nft_minted?: boolean
  nft_transaction_hash?: string
  created_at: Date
  updated_at: Date
  // Joined fields
  farmer?: User
  current_auction?: Auction
  total_bids?: number
}

export interface CropImage {
  id: string
  crop_id: string
  image_url: string
  pinata_hash?: string
  is_primary: boolean
  caption?: string
  created_at: Date
}

export interface Auction {
  id: string
  crop_id: string
  starting_price: number
  current_highest_bid?: number
  highest_bidder_id?: string
  reserve_price?: number
  bid_increment: number
  start_time: Date
  end_time: Date
  status: 'upcoming' | 'active' | 'ended' | 'cancelled'
  total_bids: number
  created_at: Date
  updated_at: Date
  // Joined fields
  crop?: Crop
  highest_bidder?: User
  bids?: Bid[]
}

export interface Bid {
  id: string
  auction_id: string
  bidder_id: string
  amount: number
  is_winning: boolean
  bid_time: Date
  transaction_hash?: string
  created_at: Date
  // Joined fields
  bidder?: User
  auction?: Auction
}

export interface Order {
  id: string
  crop_id: string
  buyer_id: string
  farmer_id: string
  auction_id?: string
  quantity: number
  unit_price: number
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  delivery_status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  delivery_address?: string
  delivery_date?: Date
  transaction_hash?: string
  created_at: Date
  updated_at: Date
  // Joined fields
  crop?: Crop
  buyer?: User
  farmer?: User
  auction?: Auction
}

export interface Offer {
  id: string
  crop_id: string
  buyer_id: string
  quantity: number
  price_per_unit: number
  total_amount: number
  message?: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  expires_at?: Date
  created_at: Date
  updated_at: Date
  // Joined fields
  crop?: Crop
  buyer?: User
}

export interface Review {
  id: string
  order_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment?: string
  created_at: Date
  // Joined fields
  reviewer?: User
  reviewee?: User
  order?: Order
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  created_at: Date
}

// API Request/Response types
export interface CreateCropRequest {
  title: string
  description: string
  crop_type: string
  variety?: string
  quantity: number
  unit?: string
  harvest_date?: string
  location?: string
  latitude?: number
  longitude?: number
  organic_certified?: boolean
  quality_grade?: string
  moisture_content?: number
  storage_conditions?: string
  minimum_price?: number
  starting_price?: number
  buyout_price?: number
  images?: string[]
  documents?: any[]
  ipfs_hash?: string
  nft_metadata_url?: string
  nft_token_id?: string
  nft_minted?: boolean
  nft_transaction_hash?: string
}

export interface CreateAuctionRequest {
  crop_id: string
  starting_price: number
  reserve_price?: number
  bid_increment?: number
  duration_hours: number
}

export interface PlaceBidRequest {
  auction_id: string
  amount: number
  transaction_hash?: string
}

export interface CreateOfferRequest {
  crop_id: string
  quantity: number
  price_per_unit: number
  message?: string
  expires_in_hours?: number
}

// Filter and pagination types
export interface CropFilters {
  crop_type?: string
  location?: string
  organic_certified?: boolean
  min_price?: number
  max_price?: number
  status?: string[]
  farmer_id?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}