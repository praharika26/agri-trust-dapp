import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/database'
import { supabase } from '@/lib/database'
import type { Order } from '@/lib/types/database'

// GET /api/orders - Get orders for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_address = searchParams.get('wallet_address')
    const type = searchParams.get('type') // 'buyer' or 'seller'

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await UserService.findOrCreateUser(wallet_address)
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        crop:crops!crop_id (
          id,
          title,
          crop_type,
          quantity,
          unit,
          images,
          farmer:users!farmer_id (
            id,
            wallet_address,
            email
          )
        ),
        buyer:users!buyer_id (
          id,
          wallet_address,
          email
        )
      `)

    if (type === 'seller') {
      // Get orders where user is the farmer (seller)
      query = query.eq('crop.farmer_id', user.id)
    } else {
      // Get orders where user is the buyer
      query = query.eq('buyer_id', user.id)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    const orders = (data || []).map(order => ({
      ...order,
      crop: {
        ...Array.isArray(order.crop) ? order.crop[0] : order.crop,
        farmer: Array.isArray(order.crop?.farmer) ? order.crop.farmer[0] : order.crop?.farmer,
      },
      buyer: Array.isArray(order.buyer) ? order.buyer[0] : order.buyer,
    }))

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      wallet_address, 
      crop_id, 
      quantity, 
      price_per_unit, 
      transaction_hash,
      order_type = 'direct_purchase' 
    } = body

    if (!wallet_address || !crop_id || !quantity || !price_per_unit) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet_address, crop_id, quantity, price_per_unit' },
        { status: 400 }
      )
    }

    // Find user
    const user = await UserService.findOrCreateUser(wallet_address)
    
    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        crop_id,
        buyer_id: user.id,
        quantity,
        price_per_unit,
        total_amount: quantity * price_per_unit,
        order_type,
        status: 'pending',
        transaction_hash,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}