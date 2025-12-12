"use client"

import { useUser } from "@/context/user-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, UserCheck, ArrowRightLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function QuickRoleSwitch() {
  const { userRole, setUserRole } = useUser()
  const router = useRouter()

  if (!userRole) return null

  const otherRole = userRole === "farmer" ? "user" : "farmer"
  const otherRoleLabel = otherRole === "farmer" ? "Farmer" : "Buyer"
  const otherRoleIcon = otherRole === "farmer" ? User : UserCheck
  const otherRoleEmoji = otherRole === "farmer" ? "🌾" : "🛒"

  const handleQuickSwitch = () => {
    setUserRole(otherRole)
    router.push(otherRole === "farmer" ? "/dashboard" : "/marketplace")
  }

  return (
    <Card className="border-dashed border-2 border-gray-200 hover:border-gray-300 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{otherRoleEmoji}</div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Switch to {otherRoleLabel}
              </p>
              <p className="text-xs text-gray-500">
                Access {otherRole === "farmer" ? "crop management" : "marketplace"} features
              </p>
            </div>
          </div>
          <Button
            onClick={handleQuickSwitch}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Switch
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}