import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // In production, fetch from database
  const crops = [
    {
      id: "1",
      cropName: "Organic Tomatoes",
      cropType: "vegetable",
      quantity: 100,
      unit: "kg",
      price: "0.5",
      imageHash: "QmVGtdTZdTSg7wnAZj73m5leJ9StqKQqnVQUgnPW7u",
      farmerAddress: "0x1234...5678",
    },
  ]
  return NextResponse.json({ crops })
}
