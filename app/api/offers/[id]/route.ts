import { NextRequest, NextResponse } from 'next/server'
import { OfferService } from '@/lib/services/database'

// PUT /api/offers/[id] - Update offer status (accept/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status }: { status: 'accepted' | 'rejected' } = body

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (accepted or rejected)' },
        { status: 400 }
      )
    }

    const offer = await OfferService.updateOfferStatus(params.id, status)
    
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(offer)
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    )
  }
}