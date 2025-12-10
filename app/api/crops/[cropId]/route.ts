import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { cropId: string } }) {
  // Mock crop detail
  const crop = {
    id: params.cropId,
    cropName: "Organic Tomatoes",
    cropType: "vegetable",
    quantity: 100,
    unit: "kg",
    price: "0.5",
    description: "Premium organic tomatoes grown using sustainable farming practices.",
    imageHash: "QmVGtdTZdTSg7wnAZj73m5leJ9StqKQqnVQUgnPW7u",
    farmerAddress: "0x1234567890123456789012345678901234567890",
    createdAt: new Date().toISOString(),
  }
  return NextResponse.json({ crop })
}
