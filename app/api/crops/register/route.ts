import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const crops: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const crop = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      createdAt: new Date().toISOString(),
    }
    crops.push(crop)
    return NextResponse.json({ success: true, crop })
  } catch (error) {
    return NextResponse.json({ error: "Failed to register crop" }, { status: 500 })
  }
}
