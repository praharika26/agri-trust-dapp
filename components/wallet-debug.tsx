"use client"

import { useWallets } from '@privy-io/react-auth'
import { useUser } from '@/context/user-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function WalletDebug() {
  const { wallets } = useWallets()
  const { isAuthenticated } = useUser()

  if (!isAuthenticated || wallets.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Wallet Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No wallet connected</p>
        </CardContent>
      </Card>
    )
  }

  const wallet = wallets[0]

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Wallet Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs">
          <p><strong>Wallet Type:</strong> {wallet.walletClientType}</p>
          <p><strong>Chain ID:</strong> {wallet.chainId || 'Not available'}</p>
          <p><strong>Address:</strong> {wallet.address}</p>
          
          <div className="mt-4">
            <p><strong>Available Methods:</strong></p>
            <ul className="list-disc list-inside text-xs space-y-1">
              {Object.getOwnPropertyNames(wallet).map(prop => (
                <li key={prop}>{prop}: {typeof (wallet as any)[prop]}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4">
            <p><strong>Prototype Methods:</strong></p>
            <ul className="list-disc list-inside text-xs space-y-1">
              {Object.getOwnPropertyNames(Object.getPrototypeOf(wallet)).map(prop => (
                <li key={prop}>{prop}: {typeof (wallet as any)[prop]}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}