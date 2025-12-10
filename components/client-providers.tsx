"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { UserProvider } from "@/context/user-context"
import Navigation from "@/components/navigation"
import type { ReactNode } from "react"
import { sepolia } from "viem/chains"

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        defaultChain: sepolia,
        supportedChains: [sepolia],
        appearance: {
          theme: "light",
          accentColor: "#059669",
        },
      }}
    >
      <UserProvider>
        <Navigation />
        {children}
      </UserProvider>
    </PrivyProvider>
  )
}
