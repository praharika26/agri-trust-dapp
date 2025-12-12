import { NextRequest, NextResponse } from 'next/server'
import { CropService, UserService } from '@/lib/services/database'
import type { CreateCropRequest, CropFilters, PaginationParams } from '@/lib/types/database'

// GET /api/crops - Get all crops with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filters
    const filters: CropFilters = {
      crop_type: searchParams.get('crop_type') || undefined,
      location: searchParams.get('location') || undefined,
      organic_certified: searchParams.get('organic_certified') === 'true' ? true : 
                        searchParams.get('organic_certified') === 'false' ? false : undefined,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
      farmer_id: searchParams.get('farmer_id') || undefined,
    }

    // Parse pagination
    const pagination: PaginationParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    }

    const result = await CropService.getCrops(filters, pagination)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching crops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crops' },
      { status: 500 }
    )
  }
}

// POST /api/crops - Create a new crop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, crop_data }: { wallet_address: string; crop_data: CreateCropRequest } = body

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Find or create user
    const user = await UserService.findOrCreateUser(wallet_address)
    
    // Validate required fields
    if (!crop_data.title || !crop_data.description || !crop_data.crop_type || !crop_data.quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, crop_type, quantity' },
        { status: 400 }
      )
    }

    // Create crop
    const crop = await CropService.createCrop(user.id, crop_data)
    
    return NextResponse.json(crop, { status: 201 })
  } catch (error) {
    console.error('Error creating crop:', error)
    return NextResponse.json(
      { error: 'Failed to create crop' },
      { status: 500 }
    )
  }
}