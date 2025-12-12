"use client"

import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Wallet } from "lucide-react"

export default function DashboardPage() {
  const { userRole } = useUser()
  const router = useRouter()

  if (!userRole) {
    router.push("/")
    return null
  }

  if (userRole === "farmer") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-8">Farmer Dashboard</h1>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Stats Cards */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-emerald-900">Active Listings</h3>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">12</p>
              <p className="text-sm text-emerald-600 mt-2">+2 this week</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-emerald-900">Live Auctions</h3>
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-600">3</p>
              <p className="text-sm text-orange-600 mt-2">Active bidding</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-emerald-900">Total Offers</h3>
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">28</p>
              <p className="text-sm text-emerald-600 mt-2">5 pending</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-emerald-900">Revenue</h3>
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">5.2 ETH</p>
              <p className="text-sm text-emerald-600 mt-2">Lifetime earnings</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200 mb-8">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={() => router.push("/register-crop")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Register New Crop
              </Button>
              <Button variant="outline" onClick={() => router.push("/my-crops")} className="border-emerald-300">
                View My Crops
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-emerald-200">
                <div>
                  <p className="font-semibold text-emerald-900">Wheat auction ended</p>
                  <p className="text-sm text-emerald-600">1 hour ago</p>
                </div>
                <span className="text-orange-600">+1.2 ETH</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-emerald-200">
                <div>
                  <p className="font-semibold text-emerald-900">New bid on Tomatoes</p>
                  <p className="text-sm text-emerald-600">2 hours ago</p>
                </div>
                <span className="text-orange-600">0.6 ETH</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-emerald-200">
                <div>
                  <p className="font-semibold text-emerald-900">New offer received</p>
                  <p className="text-sm text-emerald-600">1 day ago</p>
                </div>
                <span className="text-emerald-600">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Buyer Dashboard
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-8">Buyer Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-emerald-900">Active Offers</h3>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">8</p>
            <p className="text-sm text-emerald-600 mt-2">Pending responses</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-emerald-900">Purchases</h3>
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">15</p>
            <p className="text-sm text-emerald-600 mt-2">Total completed</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-emerald-900">Spent</h3>
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">3.8 ETH</p>
            <p className="text-sm text-emerald-600 mt-2">Total spent</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200 mb-8">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => router.push("/marketplace")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Browse Marketplace
            </Button>
            <Button variant="outline" onClick={() => router.push("/purchase-history")} className="border-emerald-300">
              View Purchase History
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-emerald-200">
              <div>
                <p className="font-semibold text-emerald-900">Offer accepted for Wheat</p>
                <p className="text-sm text-emerald-600">3 hours ago</p>
              </div>
              <span className="text-green-600">Accepted</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-emerald-200">
              <div>
                <p className="font-semibold text-emerald-900">Offer sent for Tomatoes</p>
                <p className="text-sm text-emerald-600">1 day ago</p>
              </div>
              <span className="text-yellow-600">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
