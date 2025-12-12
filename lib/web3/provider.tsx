'use client'

import { WagmiConfig } from 'wagmi'
import { wagmiConfig } from './config'
import type { ReactNode } from 'react'

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      {children}
    </WagmiConfig>
  )
}