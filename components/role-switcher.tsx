"use client"

import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, UserCheck, ArrowRight } from "lucide-react"

interface RoleSwitcherProps {
  onRoleSelect?: (role: "farmer" | "user") => void
  showCurrentRole?: boolean
}

export default function RoleSwitcher({ onRoleSelect, showCurrentRole = false }: RoleSwitcherProps) {
  const { userRole, setUserRole } = useUser()

  const handleRoleSelect = (role: "farmer" | "user") => {
    setUserRole(role)
    onRoleSelect?.(role)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Farmer Card */}
      <Card 
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
          userRole === "farmer" 
            ? "border-emerald-500 bg-emerald-50" 
            : "border-emerald-200 hover:border-emerald-400"
        }`}
        onClick={() => handleRoleSelect("farmer")}
      >
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🌾</div>
          <CardTitle className="flex items-center justify-center gap-2 text-emerald-900">
            <User className="w-5 h-5" />
            Farmer
            {userRole === "farmer" && showCurrentRole && (
              <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full">Current</span>
            )}
          </CardTitle>
          <CardDescription>
            List your crops, manage offers, and reach buyers directly through our decentralized marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={userRole === "farmer" && showCurrentRole}
          >
            {userRole === "farmer" && showCurrentRole ? "Current Role" : "Select Farmer"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Buyer Card */}
      <Card 
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
          userRole === "user" 
            ? "border-cyan-500 bg-cyan-50" 
            : "border-cyan-200 hover:border-cyan-400"
        }`}
        onClick={() => handleRoleSelect("user")}
      >
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🛒</div>
          <CardTitle className="flex items-center justify-center gap-2 text-cyan-900">
            <UserCheck className="w-5 h-5" />
            Buyer
            {userRole === "user" && showCurrentRole && (
              <span className="text-xs bg-cyan-600 text-white px-2 py-1 rounded-full">Current</span>
            )}
          </CardTitle>
          <CardDescription>
            Browse verified crops, place bids, and purchase directly from farmers with blockchain verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full bg-cyan-600 hover:bg-cyan-700"
            disabled={userRole === "user" && showCurrentRole}
          >
            {userRole === "user" && showCurrentRole ? "Current Role" : "Select Buyer"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}