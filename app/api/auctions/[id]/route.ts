import { NextRequest, NextResponse } from 'next/server'
import { AuctionService } from '@/lib/services/database'

// GET /api/auctions/[id] - Get auction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auction = await AuctionService.getAuctionById(params.id)
    
    if (!auction) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(auction)
  } catch (error) {
    console.error('Error fetching auction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch auction' },
      { status: 500 }
    )
  }
}