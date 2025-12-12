import { NextRequest, NextResponse } from 'next/server'
import { AuctionService, UserService } from '@/lib/services/database'
import type { CreateAuctionRequest } from '@/lib/types/database'

// POST /api/auctions - Create a new auction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, auction_data }: { wallet_address: string; auction_data: CreateAuctionRequest } = body

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await UserService.findOrCreateUser(wallet_address)
    
    // Validate required fields
    if (!auction_data.crop_id || !auction_data.starting_price || !auction_data.duration_hours) {
      return NextResponse.json(
        { error: 'Missing required fields: crop_id, starting_price, duration_hours' },
        { status: 400 }
      )
    }

    // Create auction
    const auction = await AuctionService.createAuction(auction_data)
    
    return NextResponse.json(auction, { status: 201 })
  } catch (error) {
    console.error('Error creating auction:', error)
    return NextResponse.json(
      { error: 'Failed to create auction' },
      { status: 500 }
    )
  }
}