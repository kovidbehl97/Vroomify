// components/ProtectedRoute.tsx
"use client"; // Essential for using hooks like useAuth, useRouter, useEffect

import React, { useEffect } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import { useAuth } from "../context/AuthContext"; // Adjust path as needed

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string; // Optional: Where to redirect if not authenticated
}

const ProtectedRoute = ({
  children,
  redirectPath = "/login", // Default redirect path
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the loading state is resolved
    if (!loading) {
      // If not loading and no user is authenticated, redirect
      if (!user) {
        router.push(redirectPath);
      }
    }
  }, [user, loading, router, redirectPath]); // Dependencies for the effect

  // 1. While loading, show a loading indicator or return null
  if (loading) {
    return <div>Loading authentication state...</div>; // Or a spinner component
  }

  // 2. If loading is finished and user is authenticated, render the children
  if (!loading && user) {
    return <>{children}</>;
  }

  // 3. If loading is finished and user is not authenticated,
  //    return null. The useEffect above will trigger the redirect.
  //    Returning null prevents rendering the children briefly before redirecting.
  return null;
};

export default ProtectedRoute;
