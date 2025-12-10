"use client"

import { useUser } from "@/context/user-context"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Navigation() {
  const { userRole, setUserRole, walletAddress, isAuthenticated, logout } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Navigation links based on user role
  const farmerLinks = [
    { href: "/register-crop", label: "Register Crop" },
    { href: "/my-crops", label: "My Crops" },
    { href: "/my-offers", label: "My Offers" },
    { href: "/dashboard", label: "Dashboard" },
  ]

  const userLinks = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/my-bids", label: "My Bids" },
    { href: "/purchase-history", label: "Purchase History" },
  ]

  const links = userRole === "farmer" ? farmerLinks : userRole === "user" ? userLinks : []

  return (
    <nav className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              🌱
            </div>
            <span className="font-bold text-lg text-emerald-900">AgriTrust</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && userRole && (
            <div className="hidden md:flex gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-emerald-600 border-b-2 border-emerald-600"
                      : "text-emerald-700 hover:text-emerald-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Auth Button */}
          <div className="flex items-center gap-4">
            {isAuthenticated && walletAddress && (
              <span className="text-xs text-emerald-600 font-mono bg-emerald-100 px-3 py-1 rounded-full">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent"
            >
              {isAuthenticated ? "Disconnect" : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
