"use client"

import { useUser } from "@/context/user-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Wallet, Loader2 } from "lucide-react"
import { useDashboardStats, isFarmerStats, isBuyerStats } from "@/hooks/use-dashboard-stats"
import { useRecentActivity, formatActivityTime, getActivityStatusColor, formatActivityAmount } from "@/hooks/use-recent-activity"

export default function DashboardPage() {
  const { userRole } = useUser()
  const router = useRouter()
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats()
  const { activities, loading: activityLoading, error: activityError } = useRecentActivity(5)

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
            {statsLoading ? (
              <div className="col-span-4 flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span className="ml-2 text-emerald-600">Loading statistics...</span>
              </div>
            ) : statsError ? (
              <div className="col-span-4 text-center py-8 text-red-600">
                Error loading statistics: {statsError}
              </div>
            ) : isFarmerStats(stats) ? (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-emerald-900">Active Listings</h3>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">{stats.crops.active}</p>
                  <p className="text-sm text-emerald-600 mt-2">{stats.crops.total} total crops</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-emerald-900">Live Auctions</h3>
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{stats.auctions.active}</p>
                  <p className="text-sm text-orange-600 mt-2">Active bidding</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-emerald-900">Total Offers</h3>
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">{stats.offers.total}</p>
                  <p className="text-sm text-emerald-600 mt-2">{stats.offers.pending} pending</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-emerald-900">Revenue</h3>
                    <Wallet className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${stats.revenue.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-emerald-600 mt-2">Lifetime earnings</p>
                </div>
              </>
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-600">
                No statistics available
              </div>
            )}
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
            {activityLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="ml-2 text-emerald-600">Loading activity...</span>
              </div>
            ) : activityError ? (
              <div className="text-center py-8 text-red-600">
                Error loading activity: {activityError}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center pb-4 border-b border-emerald-200 last:border-b-0">
                    <div>
                      <p className="font-semibold text-emerald-900">{activity.title}</p>
                      <p className="text-sm text-emerald-600">{formatActivityTime(activity.timestamp)}</p>
                    </div>
                    <span className={getActivityStatusColor(activity.type, activity.status)}>
                      {activity.amount ? formatActivityAmount(activity.amount) : activity.status || 'Completed'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                No recent activity
              </div>
            )}
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
          {statsLoading ? (
            <div className="col-span-3 flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="ml-2 text-emerald-600">Loading statistics...</span>
            </div>
          ) : statsError ? (
            <div className="col-span-3 text-center py-8 text-red-600">
              Error loading statistics: {statsError}
            </div>
          ) : isBuyerStats(stats) ? (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-emerald-900">Active Offers</h3>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-600">{stats.offers.pending}</p>
                <p className="text-sm text-emerald-600 mt-2">{stats.offers.total} total offers</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-emerald-900">Purchases</h3>
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-600">{stats.purchases.completed}</p>
                <p className="text-sm text-emerald-600 mt-2">{stats.purchases.total} total orders</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-emerald-900">Spent</h3>
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-600">
                  ${stats.spending.total.toFixed(2)}
                </p>
                <p className="text-sm text-emerald-600 mt-2">Total spent</p>
              </div>
            </>
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-600">
              No statistics available
            </div>
          )}
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
          {activityLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="ml-2 text-emerald-600">Loading activity...</span>
            </div>
          ) : activityError ? (
            <div className="text-center py-8 text-red-600">
              Error loading activity: {activityError}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex justify-between items-center pb-4 border-b border-emerald-200 last:border-b-0">
                  <div>
                    <p className="font-semibold text-emerald-900">{activity.title}</p>
                    <p className="text-sm text-emerald-600">{formatActivityTime(activity.timestamp)}</p>
                  </div>
                  <span className={getActivityStatusColor(activity.type, activity.status)}>
                    {activity.amount ? formatActivityAmount(activity.amount) : activity.status || 'Completed'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
