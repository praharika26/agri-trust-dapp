"use client"

import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const { isAuthenticated, userRole, setUserRole, login } = useUser()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated && userRole) {
      router.push(userRole === "farmer" ? "/dashboard" : "/marketplace")
    }
  }, [isAuthenticated, userRole, router])

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-emerald-900 mb-4">AgriTrust</h1>
          <p className="text-xl text-emerald-700 mb-8">Blockchain-powered agriculture marketplace</p>
        </div>

        {!isAuthenticated ? (
          <div className="flex justify-center mb-12">
            <Button onClick={login} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg">
              Connect Wallet
            </Button>
          </div>
        ) : !userRole ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-12 border border-emerald-200">
              <h2 className="text-2xl font-bold text-emerald-900 mb-6 text-center">Select Your Role</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Farmer Card */}
                <div
                  onClick={() => setUserRole("farmer")}
                  className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-8 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-emerald-500"
                >
                  <div className="text-4xl mb-4">🌾</div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-3">I'm a Farmer</h3>
                  <p className="text-emerald-700 mb-6">
                    List your crops, manage offers, and reach buyers directly through our decentralized marketplace.
                  </p>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Select</Button>
                </div>

                {/* Buyer Card */}
                <div
                  onClick={() => setUserRole("user")}
                  className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-xl p-8 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-cyan-500"
                >
                  <div className="text-4xl mb-4">🛒</div>
                  <h3 className="text-xl font-bold text-cyan-900 mb-3">I'm a Buyer</h3>
                  <p className="text-cyan-700 mb-6">
                    Browse verified crops, place bids, and purchase directly from farmers with blockchain verification.
                  </p>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Select</Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
