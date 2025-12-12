// IPFS Metadata structure for AgriTrust Crop NFTs

export interface CropNFTMetadata {
  // Standard NFT metadata
  name: string
  description: string
  image: string
  external_url?: string
  
  // Crop-specific attributes
  attributes: CropAttribute[]
  
  // Verification data
  verification: {
    farmer_address: string
    farmer_verified: boolean
    registration_date: string
    blockchain_tx: string
  }
  
  // Crop details
  crop_details: {
    type: string
    variety?: string
    quantity: number
    unit: string
    harvest_date?: string
    location?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  
  // Quality information
  quality: {
    grade?: string
    organic_certified: boolean
    moisture_content?: number
    storage_conditions?: string
    certifications?: string[]
  }
  
  // Images and documents
  media: {
    images: string[]
    documents?: string[]
    certificates?: string[]
  }
  
  // Provenance tracking
  provenance: {
    farm_name?: string
    farming_practices?: string[]
    supply_chain?: SupplyChainStep[]
  }
}

export interface CropAttribute {
  trait_type: string
  value: string | number | boolean
  display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date'
}

export interface SupplyChainStep {
  step: string
  date: string
  location?: string
  verified_by?: string
  transaction_hash?: string
}

// Helper function to create NFT metadata
export function createCropNFTMetadata(cropData: {
  title: string
  description: string
  cropType: string
  variety?: string
  quantity: number
  unit: string
  harvestDate?: string
  location?: string
  latitude?: number
  longitude?: number
  isOrganic: boolean
  qualityGrade?: string
  moistureContent?: number
  storageConditions?: string
  images: string[]
  documents?: string[]
  farmerAddress: string
  farmerVerified: boolean
  farmName?: string
  certifications?: string[]
}): CropNFTMetadata {
  
  const attributes: CropAttribute[] = [
    {
      trait_type: "Crop Type",
      value: cropData.cropType
    },
    {
      trait_type: "Quantity",
      value: cropData.quantity,
      display_type: "number"
    },
    {
      trait_type: "Unit",
      value: cropData.unit
    },
    {
      trait_type: "Organic Certified",
      value: cropData.isOrganic
    },
    {
      trait_type: "Farmer Verified",
      value: cropData.farmerVerified
    }
  ]

  // Add optional attributes
  if (cropData.variety) {
    attributes.push({
      trait_type: "Variety",
      value: cropData.variety
    })
  }

  if (cropData.qualityGrade) {
    attributes.push({
      trait_type: "Quality Grade",
      value: cropData.qualityGrade
    })
  }

  if (cropData.moistureContent) {
    attributes.push({
      trait_type: "Moisture Content",
      value: cropData.moistureContent,
      display_type: "number"
    })
  }

  if (cropData.harvestDate) {
    attributes.push({
      trait_type: "Harvest Date",
      value: cropData.harvestDate,
      display_type: "date"
    })
  }

  if (cropData.location) {
    attributes.push({
      trait_type: "Location",
      value: cropData.location
    })
  }

  return {
    name: cropData.title,
    description: cropData.description,
    image: cropData.images[0] || "",
    external_url: `https://agritrust.app/crop/${cropData.farmerAddress}`,
    
    attributes,
    
    verification: {
      farmer_address: cropData.farmerAddress,
      farmer_verified: cropData.farmerVerified,
      registration_date: new Date().toISOString(),
      blockchain_tx: "" // Will be filled after minting
    },
    
    crop_details: {
      type: cropData.cropType,
      variety: cropData.variety,
      quantity: cropData.quantity,
      unit: cropData.unit,
      harvest_date: cropData.harvestDate,
      location: cropData.location,
      coordinates: cropData.latitude && cropData.longitude ? {
        latitude: cropData.latitude,
        longitude: cropData.longitude
      } : undefined
    },
    
    quality: {
      grade: cropData.qualityGrade,
      organic_certified: cropData.isOrganic,
      moisture_content: cropData.moistureContent,
      storage_conditions: cropData.storageConditions,
      certifications: cropData.certifications
    },
    
    media: {
      images: cropData.images,
      documents: cropData.documents,
      certificates: cropData.certifications
    },
    
    provenance: {
      farm_name: cropData.farmName,
      farming_practices: cropData.isOrganic ? ["Organic Farming"] : ["Conventional Farming"],
      supply_chain: [
        {
          step: "Crop Registration",
          date: new Date().toISOString(),
          location: cropData.location,
          verified_by: cropData.farmerVerified ? "AgriTrust Platform" : "Self-Declared"
        }
      ]
    }
  }
}

// Helper to upload metadata to IPFS
export async function uploadMetadataToIPFS(metadata: CropNFTMetadata): Promise<string> {
  try {
    const response = await fetch('/api/pinata/upload-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata)
    })

    if (!response.ok) {
      throw new Error('Failed to upload metadata to IPFS')
    }

    const result = await response.json()
    return result.ipfsUrl // Returns the IPFS URL for the metadata
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error)
    throw error
  }
}

// Helper to validate NFT metadata
export function validateNFTMetadata(metadata: CropNFTMetadata): boolean {
  return !!(
    metadata.name &&
    metadata.description &&
    metadata.crop_details.type &&
    metadata.crop_details.quantity > 0 &&
    metadata.verification.farmer_address &&
    metadata.media.images.length > 0
  )
}