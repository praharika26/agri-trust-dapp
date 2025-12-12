import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/database'

// GET /api/users - Get user by wallet address
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

    const user = await UserService.findOrCreateUser(wallet_address)
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create or update user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, email, role } = body

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const user = await UserService.findOrCreateUser(wallet_address, email)
    
    // Update role if provided
    if (role && role !== user.role) {
      const updatedUser = await UserService.updateUserRole(wallet_address, role)
      return NextResponse.json(updatedUser)
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    )
  }
}

// PUT /api/users - Update user role
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet_address, role } = body

    if (!wallet_address || !role) {
      return NextResponse.json(
        { error: 'Wallet address and role are required' },
        { status: 400 }
      )
    }

    if (!['farmer', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "farmer" or "user"' },
        { status: 400 }
      )
    }

    const user = await UserService.updateUserRole(wallet_address, role)
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}