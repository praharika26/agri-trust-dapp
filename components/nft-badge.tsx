import { Shield, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface NFTBadgeProps {
  tokenId?: number | string
  isVerified?: boolean
  transactionHash?: string
  metadataUrl?: string
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
}

export function NFTBadge({ 
  tokenId, 
  isVerified = false, 
  transactionHash, 
  metadataUrl,
  size = 'md',
  showDetails = false 
}: NFTBadgeProps) {
  if (!isVerified && !tokenId) return null

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
        <Shield className={`${iconSizes[size]} mr-1`} />
        <span className={sizeClasses[size]}>
          {tokenId ? `NFT #${tokenId}` : 'NFT Verified'}
        </span>
      </Badge>
      
      {showDetails && (transactionHash || metadataUrl) && (
        <div className="flex gap-1">
          {transactionHash && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-6 px-2 text-xs"
            >
              <a
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Tx
              </a>
            </Button>
          )}
          
          {metadataUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-6 px-2 text-xs"
            >
              <a
                href={metadataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Metadata
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function NFTVerificationCard({ 
  tokenId, 
  transactionHash, 
  metadataUrl,
  farmerAddress,
  isVerified = false 
}: {
  tokenId?: number | string
  transactionHash?: string
  metadataUrl?: string
  farmerAddress?: string
  isVerified?: boolean
}) {
  if (!tokenId && !isVerified) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">
              Blockchain Verified Crop Certificate
            </h3>
          </div>
          
          {tokenId && (
            <p className="text-blue-700 text-sm mb-1">
              <span className="font-medium">NFT Token ID:</span> #{tokenId}
            </p>
          )}
          
          {farmerAddress && (
            <p className="text-blue-700 text-sm mb-1">
              <span className="font-medium">Farmer:</span> {farmerAddress.slice(0, 6)}...{farmerAddress.slice(-4)}
            </p>
          )}
          
          <p className="text-blue-600 text-xs">
            This crop's authenticity and provenance are permanently recorded on the blockchain
          </p>
        </div>
        
        <div className="flex flex-col gap-1">
          {transactionHash && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs"
            >
              <a
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View Transaction
              </a>
            </Button>
          )}
          
          {metadataUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs"
            >
              <a
                href={metadataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View Metadata
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}