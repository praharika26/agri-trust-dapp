import { NextRequest, NextResponse } from 'next/server'
import { AuctionService, UserService } from '@/lib/services/database'
import type { PlaceBidRequest } from '@/lib/types/database'

// GET /api/auctions/[id]/bids - Get all bids for an auction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bids = await AuctionService.getAuctionBids(id)
    return NextResponse.json(bids)
  } catch (error) {
    console.error('Error fetching auction bids:', error)
    return NextResponse.json(
      { error: 'Failed to fetch auction bids' },
      { status: 500 }
    )
  }
}

// POST /api/auctions/[id]/bids - Place a bid on an auction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { wallet_address, amount, transaction_hash }: { 
      wallet_address: string; 
      amount: number; 
      transaction_hash?: string 
    } = body

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid bid amount is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await UserService.findOrCreateUser(wallet_address)
    
    // Create bid data
    const bidData: PlaceBidRequest = {
      auction_id: id,
      amount,
      transaction_hash,
    }

    // Place bid
    const bid = await AuctionService.placeBid(bidData, user.id)
    
    return NextResponse.json(bid, { status: 201 })
  } catch (error) {
    console.error('Error placing bid:', error)
    
    // Handle specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to place bid' },
      { status: 500 }
    )
  }
}