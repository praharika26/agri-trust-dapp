import { NextRequest, NextResponse } from 'next/server'
import { OfferService, UserService } from '@/lib/services/database'
import type { CreateOfferRequest } from '@/lib/types/database'

// POST /api/offers - Create a new offer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, offer_data }: { wallet_address: string; offer_data: CreateOfferRequest } = body

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await UserService.findOrCreateUser(wallet_address)
    
    // Validate required fields
    if (!offer_data.crop_id || !offer_data.quantity || !offer_data.price_per_unit) {
      return NextResponse.json(
        { error: 'Missing required fields: crop_id, quantity, price_per_unit' },
        { status: 400 }
      )
    }

    // Create offer
    const offer = await OfferService.createOffer(user.id, offer_data)
    
    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    )
  }
}