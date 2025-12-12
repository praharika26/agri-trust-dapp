"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { UserProvider } from "@/context/user-context"
import Navigation from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import DebugInfo from "@/components/debug-info"
import type { ReactNode } from "react"
import { sepolia } from "viem/chains"

export default function ClientProviders({ children }: { children: ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

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

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        defaultChain: sepolia,
        supportedChains: [sepolia],
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
