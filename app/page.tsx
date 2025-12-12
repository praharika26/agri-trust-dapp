"use client"

import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import RoleSwitcher from "@/components/role-switcher"
import WalletConnectionHelp from "@/components/wallet-connection-help"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { isAuthenticated, userRole, setUserRole, login, isLoading } = useUser()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated && userRole && mounted) {
      router.push(userRole === "farmer" ? "/dashboard" : "/marketplace")
    }
  }, [isAuthenticated, userRole, router, mounted])

  const handleLogin = async () => {
    setIsConnecting(true)
    try {
      await login()
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  if (!mounted || isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-4 animate-pulse">
            🌱
          </div>
          <p className="text-emerald-700">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-emerald-900 mb-4">AgriTrust</h1>
          <p className="text-xl text-emerald-700 mb-8">Blockchain-powered agriculture marketplace</p>
        </div>

        {!isAuthenticated ? (
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Button 
                onClick={handleLogin} 
                disabled={isConnecting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting Wallet...
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            </div>
            <WalletConnectionHelp />
          </div>
        ) : !userRole ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200">
              <h2 className="text-3xl font-bold text-emerald-900 mb-2 text-center">Welcome to AgriTrust</h2>
              <p className="text-emerald-600 mb-8 text-center">Choose your role to get started</p>
              <RoleSwitcher 
                onRoleSelect={(role) => {
                  router.push(role === "farmer" ? "/dashboard" : "/marketplace")
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
