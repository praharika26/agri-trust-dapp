import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json()
    
    if (!metadata) {
      return NextResponse.json(
        { error: 'Metadata is required' },
        { status: 400 }
      )
    }

    const pinataJWT = process.env.PINATA_JWT
    if (!pinataJWT) {
      return NextResponse.json(
        { error: 'Pinata JWT not configured' },
        { status: 500 }
      )
    }

    // Upload JSON metadata to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pinataJWT}`
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `AgriTrust-${metadata.name || 'Crop'}-${Date.now()}`,
          keyvalues: {
            type: 'crop-nft-metadata',
            crop_type: metadata.crop_details?.type || 'unknown',
            farmer: metadata.verification?.farmer_address || 'unknown'
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Pinata upload failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to upload to IPFS' },
        { status: 500 }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      ipfsHash: result.IpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      pinSize: result.PinSize,
      timestamp: result.Timestamp
    })

  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}