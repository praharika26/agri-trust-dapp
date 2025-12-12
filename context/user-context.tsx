"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { toast } from "@/hooks/use-toast"

type UserRole = "farmer" | "user" | null

interface UserContextType {
  userRole: UserRole
  setUserRole: (role: UserRole) => void
  walletAddress: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { 
    login: privyLogin, 
    logout: privyLogout, 
    user, 
    authenticated, 
    ready 
  } = usePrivy()
  const [userRole, setUserRoleState] = useState<UserRole>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait for Privy to be ready before loading saved role
    if (!ready) return

    const loadSavedRole = () => {
      try {
        const savedRole = localStorage.getItem("agritrust-role")
        if (savedRole && authenticated) {
          setUserRoleState(savedRole as UserRole)
        } else if (!authenticated) {
          // Clear role if not authenticated
          setUserRoleState(null)
        }
      } catch (error) {
        console.error("Error loading saved role:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedRole()
  }, [authenticated, ready])

  const login = async () => {
    try {
      await privyLogin()
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Connection Failed",
        description: "Unable to connect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const logout = () => {
    privyLogout()
    localStorage.removeItem("agritrust-role")
    setUserRoleState(null)
  }

  const updateUserRole = (role: UserRole) => {
    const previousRole = userRole
    setUserRoleState(role)
    
    try {
      if (role) {
        localStorage.setItem("agritrust-role", role)
        
        // Show toast notification for role switch
        if (previousRole && previousRole !== role) {
          toast({
            title: "Role switched successfully!",
            description: `You are now logged in as a ${role === "farmer" ? "Farmer" : "Buyer"}.`,
          })
        } else if (!previousRole) {
          toast({
            title: "Welcome to AgriTrust!",
            description: `You are now logged in as a ${role === "farmer" ? "Farmer" : "Buyer"}.`,
          })
        }
      } else {
        localStorage.removeItem("agritrust-role")
      }
    } catch (error) {
      console.error("Error saving role:", error)
      toast({
        title: "Error",
        description: "Failed to save your role preference.",
        variant: "destructive",
      })
    }
  }

  const walletAddress = user?.linkedAccounts?.find((account) => account.type === "wallet")?.address || null

  return (
    <UserContext.Provider
      value={{
        userRole,
        setUserRole: updateUserRole,
        walletAddress,
        isAuthenticated: authenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within UserProvider")
  }
  return context
}
