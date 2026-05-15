"use client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useAuth } from "@/context/AuthContext"

const AUTH_ROUTES = ["/signin", "/signup", "/forgot-password"]
const PROTECTED_ROUTES = ["/today", "/history", "/settings", "/entry"]

export default function ShellWrapper({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))

  useEffect(() => {
    if (!loading && !user && isProtectedRoute) {
      router.push("/signin")
    }
  }, [user, loading, isProtectedRoute, router])

  if (loading) {
    if (isProtectedRoute) return <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>
  }

  // Auth pages AND protected pages handle their own layout designs natively
  if (isAuthRoute || isProtectedRoute) return <>{children}</>

  return (
    <div className="site-wrapper">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}
