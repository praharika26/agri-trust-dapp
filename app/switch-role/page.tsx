"use client"

import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCheck, ShoppingCart, ArrowLeft } from "lucide-react"

export default function SwitchRolePage() {
  const { userRole, switchRole, isAuthenticated } = useUser()
  const router = useRouter()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">Authentication Required</h1>
          <p className="text-emerald-700">Please connect your wallet to switch roles</p>
        </div>
      </div>
    )
  }

  const handleRoleSwitch = (newRole: "farmer" | "user") => {
    switchRole(newRole)
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-emerald-700 hover:text-emerald-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Switch Role</h1>
          <p className="text-emerald-700">
            Current role: <span className="font-semibold capitalize">{userRole}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            userRole === "farmer" ? "ring-2 ring-emerald-500 bg-emerald-50" : "hover:border-emerald-400"
          }`}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <UserCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-emerald-900">Farmer</CardTitle>
              <CardDescription>
                Register and sell your crops, create auctions, manage your agricultural products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-emerald-700 space-y-2 mb-6">
                <li>• Register crop certificates</li>
                <li>• Create NFT-verified crops</li>
                <li>• Start auctions</li>
                <li>• Manage crop listings</li>
                <li>• View offers and bids</li>
              </ul>
              <Button
                onClick={() => handleRoleSwitch("farmer")}
                disabled={userRole === "farmer"}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {userRole === "farmer" ? "Current Role" : "Switch to Farmer"}
              </Button>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            userRole === "user" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:border-blue-400"
          }`}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-blue-900">Buyer</CardTitle>
              <CardDescription>
                Browse and purchase crops, participate in auctions, make offers to farmers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-blue-700 space-y-2 mb-6">
                <li>• Browse marketplace</li>
                <li>• View NFT crop certificates</li>
                <li>• Participate in auctions</li>
                <li>• Make direct offers</li>
                <li>• Purchase crops</li>
              </ul>
              <Button
                onClick={() => handleRoleSwitch("user")}
                disabled={userRole === "user"}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {userRole === "user" ? "Current Role" : "Switch to Buyer"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-emerald-600">
            You can switch between roles anytime to access different features of the platform
          </p>
        </div>
      </div>
    </main>
  )
}