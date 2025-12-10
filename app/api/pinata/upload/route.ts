import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const pinataFormData = new FormData()
    pinataFormData.append("file", file)

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: pinataFormData,
    })

    if (!response.ok) {
      throw new Error("Pinata upload failed")
    }

    const data = await response.json()

    return NextResponse.json({
      ipfsHash: data.IpfsHash,
      success: true,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
