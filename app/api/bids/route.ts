import { NextRequest, NextResponse } from 'next/server'
import { AuctionService, UserService } from '@/lib/services/database'

// GET /api/bids - Get bids for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_address = searchParams.get('wallet_address')

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await UserService.findOrCreateUser(wallet_address)
    
    // Get user's bids
    const bids = await AuctionService.getUserBids(user.id)
    
    return NextResponse.json(bids)
  } catch (error) {
    console.error('Error fetching user bids:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user bids' },
      { status: 500 }
    )
  }
}