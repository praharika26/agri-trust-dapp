import { NextRequest, NextResponse } from 'next/server'
import { CropService } from '@/lib/services/database'

// GET /api/crops/[id] - Get crop by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const crop = await CropService.getCropById(params.id)
    
    if (!crop) {
      return NextResponse.json(
        { error: 'Crop not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(crop)
  } catch (error) {
    console.error('Error fetching crop:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crop' },
      { status: 500 }
    )
  }
}