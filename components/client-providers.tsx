"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { UserProvider } from "@/context/user-context"
import Navigation from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import DebugInfo from "@/components/debug-info"
import type { ReactNode } from "react"
import { sepolia } from "viem/chains"

// Define Ganache local chain for Privy
const ganacheChain = {
  id: 1337,
  name: 'Ganache Local',
  network: 'ganache',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:7545'] },
    default: { http: ['http://127.0.0.1:7545'] },
  },
  blockExplorers: {
    default: { name: 'Ganache', url: 'http://127.0.0.1:7545' },
  },
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337')

  if (!privyAppId) {
    console.error("NEXT_PUBLIC_PRIVY_APP_ID is not set")
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Configuration Error</h1>
          <p className="text-red-500">Privy App ID is not configured</p>
        </div>
      </div>
    )
  }

  // Determine which chains to support based on environment
  const isLocalDevelopment = chainId === 1337
  const defaultChain = isLocalDevelopment ? ganacheChain : sepolia
  const supportedChains = isLocalDevelopment ? [ganacheChain, sepolia] : [sepolia, ganacheChain]

  console.log('🔗 Privy Configuration:', {
    chainId,
    isLocalDevelopment,
    defaultChain: defaultChain.name,
    supportedChains: supportedChains.map(c => c.name)
  })

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        defaultChain: defaultChain,
        supportedChains: supportedChains,
        appearance: {
          theme: "light",
          accentColor: "#059669",
          logo: "/placeholder-logo.png",
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        loginMethods: ["wallet", "email"],
        walletList: ["metamask", "coinbase_wallet", "wallet_connect"],
      }}
    >
      <UserProvider>
        <Navigation />
        {children}
        <Toaster />
        <DebugInfo />
      </UserProvider>
    </PrivyProvider>
  )
}
