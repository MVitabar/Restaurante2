"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"
import { useFirebase } from "./firebase-provider"
import { useToast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

const publicRoutes = ["/login", "/register", "/forgot-password"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { auth, isInitialized, error } = useFirebase()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Comprehensive initial state logging
  useEffect(() => {
    console.group('🔐 AuthProvider Initial State');
    console.log('User:', user ? { 
      uid: user.uid, 
      email: user.email 
    } : null);
    console.log('Loading:', loading);
    console.log('Firebase Initialized:', isInitialized);
    console.log('Auth Available:', !!auth);
    console.log('Error:', error);
    console.groupEnd();
  }, []);

  useEffect(() => {
    // Immediate loading state if Firebase is not initialized
    if (!isInitialized || !auth) {
      console.warn('🚨 Firebase not fully initialized', { 
        isInitialized, 
        authAvailable: !!auth 
      });
      setLoading(true)
      return
    }

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(
      auth,
      (authUser) => {
        console.group('🔑 Auth State Change');
        console.log('New User:', authUser ? {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName
        } : null);
        
        // Update user state
        setUser(authUser)
        setLoading(false)

        // Redirect logic
        if (!authUser && !publicRoutes.includes(pathname)) {
          console.log('🚪 Redirecting to login');
          router.push("/login")
        }

        console.groupEnd();
      },
      (authError) => {
        console.error("🔥 Auth state change error:", authError)
        setLoading(false)
        toast({
          title: "Authentication Error",
          description: authError.message || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    )

    return () => unsubscribe()
  }, [auth, isInitialized, pathname, router, toast])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
