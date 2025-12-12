"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useEffect } from "react"

export default function DebugInfo() {
  const { ready, authenticated, user } = usePrivy()

  useEffect(() => {
    console.log("Privy Debug Info:", {
      ready,
      authenticated,
      user,
      appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    })
  }, [ready, authenticated, user])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs font-mono z-50">
      <div>Ready: {ready ? "✅" : "❌"}</div>
      <div>Auth: {authenticated ? "✅" : "❌"}</div>
      <div>User: {user ? "✅" : "❌"}</div>
    </div>
  )
}