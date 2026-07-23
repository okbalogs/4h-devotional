"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const AUTH_ROUTES = ["/signin", "/signup", "/forgot-password"];
const PROTECTED_ROUTES = [
  "/today",
  "/history",
  "/settings",
  "/entry",
  "/community",
];

// Determine if dev bypass is enabled (must match AuthContext's logic).
const isBypassEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

export default function ShellWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    // If bypass is enabled, consider user always authenticated for ShellWrapper's purposes.
    if (!isBypassEnabled && !loading && !user && isProtectedRoute) {
      router.push("/signin");
    }
  }, [user, loading, isProtectedRoute, router]);

  // If bypass is enabled and it's a protected route, no loading state is needed
  if (loading && !isBypassEnabled) {
    if (isProtectedRoute)
      return (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading...
        </div>
      );
  }

  // Auth pages AND protected pages handle their own layout designs natively
  if (isAuthRoute || isProtectedRoute) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1" style={{ paddingTop: pathname === '/' ? '0' : '6.5rem' }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
