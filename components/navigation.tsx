"use client"

import { useUser } from "@/context/user-context"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, User, UserCheck, LogOut, RefreshCw, Loader2 } from "lucide-react"
import { useState } from "react"

export default function Navigation() {
  const { userRole, setUserRole, walletAddress, isAuthenticated, logout, login } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleRoleSwitch = (newRole: "farmer" | "user") => {
    setUserRole(newRole)
    // Navigate to the appropriate dashboard for the new role
    router.push(newRole === "farmer" ? "/dashboard" : "/marketplace")
  }

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
            <div className="hidden md:flex gap-8 items-center">
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
              
              {/* Role Badge */}
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                userRole === "farmer" 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-cyan-100 text-cyan-700"
              }`}>
                {userRole === "farmer" ? "🌾 Farmer" : "🛒 Buyer"}
              </div>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated && walletAddress && (
              <span className="text-xs text-emerald-600 font-mono bg-emerald-100 px-3 py-1 rounded-full">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent flex items-center gap-2"
                  >
                    {userRole === "farmer" ? (
                      <>
                        <User className="w-4 h-4" />
                        Farmer
                      </>
                    ) : userRole === "user" ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Buyer
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        Account
                      </>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {userRole && (
                    <>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Switch Role
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleRoleSwitch("farmer")}
                        className="flex items-center gap-2"
                        disabled={userRole === "farmer"}
                      >
                        <User className="w-4 h-4" />
                        Switch to Farmer
                        {userRole === "farmer" && <span className="text-xs text-emerald-600">(Current)</span>}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleSwitch("user")}
                        className="flex items-center gap-2"
                        disabled={userRole === "user"}
                      >
                        <UserCheck className="w-4 h-4" />
                        Switch to Buyer
                        {userRole === "user" && <span className="text-xs text-emerald-600">(Current)</span>}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem
                    onClick={() => router.push("/switch-role")}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Change Role
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={isConnecting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
