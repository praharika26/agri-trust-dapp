"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePrivy } from "@privy-io/react-auth"

type UserRole = "farmer" | "user" | null

interface UserContextType {
  userRole: UserRole
  setUserRole: (role: UserRole) => void
  walletAddress: string | null
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { login: privyLogin, logout: privyLogout, user, authenticated } = usePrivy()
  const [userRole, setUserRoleState] = useState<UserRole>(null)

  useEffect(() => {
    const savedRole = localStorage.getItem("agritrust-role")
    if (savedRole && authenticated) {
      setUserRoleState(savedRole as UserRole)
    }
  }, [authenticated])

  const login = () => {
    privyLogin()
  }

  const logout = () => {
    privyLogout()
    localStorage.removeItem("agritrust-role")
    setUserRoleState(null)
  }

  const updateUserRole = (role: UserRole) => {
    setUserRoleState(role)
    if (role) {
      localStorage.setItem("agritrust-role", role)
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
