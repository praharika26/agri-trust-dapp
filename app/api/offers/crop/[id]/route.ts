import { NextRequest, NextResponse } from 'next/server'
import { OfferService } from '@/lib/services/database'

// GET /api/offers/crop/[id] - Get all offers for a crop
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offers = await OfferService.getCropOffers(params.id)
    return NextResponse.json(offers)
  } catch (error) {
    console.error('Error fetching crop offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crop offers' },
      { status: 500 }
    )
  }
}