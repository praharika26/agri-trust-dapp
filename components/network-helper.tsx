"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, Wifi, Settings } from 'lucide-react'
import { useWallets } from '@privy-io/react-auth'
import { useUser } from '@/context/user-context'

export default function NetworkHelper() {
  const { wallets } = useWallets()
  const { isAuthenticated } = useUser()
  const [networkStatus, setNetworkStatus] = useState<{
    connected: boolean
    chainId: number | null
    name: string
    isCorrect: boolean
  }>({
    connected: false,
    chainId: null,
    name: 'Unknown',
    isCorrect: false
  })
  const [switching, setSwitching] = useState(false)

  const targetChainId = 1337 // Ganache
  const targetNetworkName = 'Ganache Local'

  useEffect(() => {
    const checkNetwork = async () => {
      if (wallets.length > 0 && isAuthenticated) {
        try {
          const wallet = wallets[0]
          
          // Get chain ID from wallet properties
          let chainId: number | null = null
          let name = 'Unknown'
          
          // Check if chainId is available directly on wallet
          if (wallet.chainId) {
            // Handle EIP-155 format (e.g., "eip155:1337")
            const chainIdStr = wallet.chainId.toString()
            if (chainIdStr.includes(':')) {
              chainId = Number(chainIdStr.split(':')[1])
            } else {
              chainId = Number(chainIdStr)
            }
          }
          
          if (chainId) {
            if (chainId === 1337) {
              name = 'Ganache Local'
            } else if (chainId === 11155111) {
              name = 'Sepolia Testnet'
            } else if (chainId === 1) {
              name = 'Ethereum Mainnet'
            } else if (chainId === 5777) {
              name = 'Ganache (5777)'
            } else {
              name = `Chain ${chainId}`
            }
            
            setNetworkStatus({
              connected: true,
              chainId,
              name,
              isCorrect: chainId === targetChainId
            })
          } else {
            // If chainId not available, show as connected but unknown
            setNetworkStatus({
              connected: true,
              chainId: null,
              name: 'Connected (Unknown Network)',
              isCorrect: false
            })
          }
        } catch (error) {
          console.error('Failed to get network info:', error)
          setNetworkStatus({
            connected: false,
            chainId: null,
            name: 'Connection Error',
            isCorrect: false
          })
        }
      } else {
        setNetworkStatus({
          connected: false,
          chainId: null,
          name: 'Not Connected',
          isCorrect: false
        })
      }
    }

    checkNetwork()
    
    // Check network every 10 seconds (less frequent to avoid errors)
    const interval = setInterval(checkNetwork, 10000)
    return () => clearInterval(interval)
  }, [wallets, isAuthenticated, targetChainId])

  const switchToGanache = async () => {
    if (wallets.length === 0) return

    setSwitching(true)
    try {
      const wallet = wallets[0]
      
      console.log('🔄 Attempting to switch to Ganache (Chain ID: 1337)...')
      
      try {
        // Try to switch to Ganache using Privy's switchChain method
        await wallet.switchChain(targetChainId)
        console.log('✅ Successfully switched to Ganache')
      } catch (switchError: any) {
        console.log('⚠️ Direct switch failed, trying to add network first:', switchError.message)
        
        // If switching fails, try to add the network using ethereum provider
        try {
          const provider = await wallet.getEthereumProvider()
          
          console.log('➕ Adding Ganache network to wallet...')
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`, // 0x539
              chainName: targetNetworkName,
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:7545'],
              blockExplorerUrls: [],
            }],
          })
          
          console.log('✅ Network added, switching again...')
          // Try switching again after adding
          await wallet.switchChain(targetChainId)
          console.log('✅ Successfully switched to Ganache after adding network')
        } catch (addError: any) {
          console.error('❌ Failed to add network:', addError)
          throw new Error(`Failed to add Ganache network. Make sure Ganache is running on port 7545. Error: ${addError.message}`)
        }
      }
    } catch (error: any) {
      console.error('❌ Network switch failed:', error)
      alert(`Failed to switch network: ${error.message}`)
    } finally {
      setSwitching(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet first to check network status.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Network Status
        </CardTitle>
        <CardDescription>
          Current blockchain network connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Network:</span>
          <div className="flex items-center gap-2">
            {networkStatus.isCorrect ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm ${
              networkStatus.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {networkStatus.name}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Chain ID:</span>
          <span className="text-sm font-mono">
            {networkStatus.chainId || 'Unknown'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <span className={`text-sm font-medium ${
            networkStatus.isCorrect ? 'text-green-600' : 'text-red-600'
          }`}>
            {networkStatus.isCorrect ? 'Connected to Ganache' : 'Wrong Network'}
          </span>
        </div>

        {!networkStatus.isCorrect && networkStatus.connected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're connected to {networkStatus.name} but AgriTrust requires Ganache Local (Chain ID: 1337).
            </AlertDescription>
          </Alert>
        )}

        {!networkStatus.isCorrect && (
          <Button 
            onClick={switchToGanache}
            disabled={switching}
            className="w-full"
            variant={networkStatus.connected ? "outline" : "default"}
          >
            <Settings className="w-4 h-4 mr-2" />
            {switching ? 'Switching...' : `Switch to ${targetNetworkName}`}
          </Button>
        )}

        {networkStatus.isCorrect && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Ready for AgriTrust!</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              You're connected to the correct network for local development.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}