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
import { ChevronDown, User, UserCheck, LogOut, RefreshCw, Loader2, Wifi, WifiOff } from "lucide-react"
import { useState, useEffect } from "react"
import { useWallets } from "@privy-io/react-auth"

export default function Navigation() {
  const { userRole, setUserRole, walletAddress, isAuthenticated, logout, login } = useUser()
  const { wallets } = useWallets()
  const router = useRouter()
  const pathname = usePathname()
  const [isConnecting, setIsConnecting] = useState(false)
  const [networkInfo, setNetworkInfo] = useState<{ chainId: number; name: string } | null>(null)

  // Get current network info
  useEffect(() => {
    const getNetworkInfo = async () => {
      if (wallets.length > 0 && isAuthenticated) {
        try {
          const wallet = wallets[0]
          
          // Get chain ID from wallet properties
          if (wallet.chainId) {
            // Handle EIP-155 format (e.g., "eip155:1337")
            const chainIdStr = wallet.chainId.toString()
            const chainId = chainIdStr.includes(':') 
              ? Number(chainIdStr.split(':')[1])
              : Number(chainIdStr)
            let name = 'Unknown'
            
            if (chainId === 1337) {
              name = 'Ganache'
            } else if (chainId === 11155111) {
              name = 'Sepolia'
            } else if (chainId === 1) {
              name = 'Mainnet'
            } else {
              name = `Chain ${chainId}`
            }
            
            setNetworkInfo({ chainId, name })
          } else {
            setNetworkInfo(null)
          }
        } catch (error) {
          console.error('Failed to get network info:', error)
          setNetworkInfo(null)
        }
      } else {
        setNetworkInfo(null)
      }
    }

    getNetworkInfo()
  }, [wallets, isAuthenticated])

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
    { href: "/auctions", label: "Live Auctions" },
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
            {/* Network Status */}
            {isAuthenticated && networkInfo && (
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                networkInfo.chainId === 1337 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {networkInfo.chainId === 1337 ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                {networkInfo.name}
              </div>
            )}
            
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
