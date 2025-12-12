import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/database'

// GET /api/orders/[id] - Get order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const { data: order, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (error) throw error

    const formattedOrder = {
      ...order,
      crop: {
        ...Array.isArray(order.crop) ? order.crop[0] : order.crop,
        farmer: Array.isArray(order.crop?.farmer) ? order.crop.farmer[0] : order.crop?.farmer,
      },
      buyer: Array.isArray(order.buyer) ? order.buyer[0] : order.buyer,
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, transaction_hash } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (transaction_hash) {
      updateData.transaction_hash = transaction_hash
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (error) throw error

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}