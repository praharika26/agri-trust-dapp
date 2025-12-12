import { NextRequest, NextResponse } from 'next/server'
import { CropService, UserService } from '@/lib/services/database'
import { DateValidator } from '@/lib/validation/date-validator'
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
        { 
          error: 'Validation failed',
          details: 'Wallet address is required',
          field: 'wallet_address'
        },
        { status: 400 }
      )
    }

    // Find or create user
    const user = await UserService.findOrCreateUser(wallet_address)
    
    // Validate required fields
    if (!crop_data.title || !crop_data.description || !crop_data.crop_type || !crop_data.quantity) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: 'Missing required fields: title, description, crop_type, quantity',
          field: 'required_fields'
        },
        { status: 400 }
      )
    }

    // Validate harvest date if provided (Requirements 2.3, 2.5)
    if (crop_data.harvest_date) {
      const dateValidation = DateValidator.validateHarvestDate(crop_data.harvest_date)
      
      if (!dateValidation.isValid) {
        // Log date validation error for debugging (Requirements 2.4)
        console.error('Date validation failed:', {
          wallet_address,
          harvest_date: crop_data.harvest_date,
          error: dateValidation.error,
          timestamp: new Date().toISOString(),
          crop_title: crop_data.title
        })

        return NextResponse.json(
          {
            error: 'Date validation failed',
            details: dateValidation.error,
            field: 'harvest_date',
            provided_value: crop_data.harvest_date
          },
          { status: 400 }
        )
      }

      // Log warning for future dates but allow submission (Requirements 1.3)
      if (dateValidation.warning) {
        console.warn('Future harvest date detected:', {
          wallet_address,
          harvest_date: crop_data.harvest_date,
          warning: dateValidation.warning,
          timestamp: new Date().toISOString(),
          crop_title: crop_data.title
        })
      }
    }

    // Create crop (CropService.createCrop handles date sanitization internally)
    const crop = await CropService.createCrop(user.id, crop_data)
    
    return NextResponse.json(crop, { status: 201 })
  } catch (error) {
    // Enhanced error logging for date validation errors (Requirements 2.4)
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      endpoint: '/api/crops',
      method: 'POST'
    }

    // Check if this is a date validation error from CropService
    if (error instanceof Error && error.message.includes('harvest date')) {
      console.error('Date validation error in crop creation:', errorDetails)
      return NextResponse.json(
        {
          error: 'Date validation failed',
          details: error.message,
          field: 'harvest_date'
        },
        { status: 400 }
      )
    }

    // Log general errors
    console.error('Error creating crop:', errorDetails)
    
    return NextResponse.json(
      { 
        error: 'Failed to create crop',
        details: 'An internal server error occurred. Please try again.'
      },
      { status: 500 }
    )
  }
}