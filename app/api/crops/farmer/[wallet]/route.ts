import { NextRequest, NextResponse } from 'next/server'
import { CropService, UserService } from '@/lib/services/database'

// GET /api/crops/farmer/[wallet] - Get crops by farmer wallet address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    // Await params as required by Next.js 15
    const { wallet } = await params
    
    // Find user by wallet address
    const user = await UserService.findOrCreateUser(wallet)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      )
    }

    const crops = await CropService.getFarmerCrops(user.id)
    
    return NextResponse.json(crops)
  } catch (error) {
    console.error('Error fetching farmer crops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch farmer crops' },
      { status: 500 }
    )
  }
}