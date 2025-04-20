// File: app/components/Navbar.tsx
"use client";
// Remove useState, useEffect, and your custom fetch
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  // Use the useSession hook provided by next-auth
  // session will contain user info (name, email, id, role etc.) if authenticated
  // status can be 'loading', 'authenticated', 'unauthenticated'
  const { data: session, status } = useSession();

  const pathname = usePathname(); // Get the current path

  // console.log('Navbar Rendering with useSession. Status:', status, 'Session:', session); // Keep for debugging if needed

  const isUserLoggedIn = status === "authenticated";
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";
  // const isAuthPage = isLoginPage || isRegisterPage; // isAuthPage variable is not strictly needed

  // Show a loading state or basic navbar while session status is loading

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Always show the site title linking to Home */}
        <Link href="/" className="text-xl font-bold hover:underline">
          Vroomify
        </Link>

        {/* Navigation Links */}
        <div>
          {/* Always show Home */}
          {pathname !== "/" 
          && (<Link href="/" className="mx-2 hover:underline">
              Home
            </Link>
          )}
          {isUserLoggedIn ? (
            // --- Links for Logged-in Users (using session data) ---
            <>
              {/* Hide login/register links when logged in */}
              <Link href="/history" className="mx-2 hover:underline">
                Booking History
              </Link>
              {/* Access user role from session.user (set in callbacks) */}
              {session?.user?.role === "admin" && (
                <Link href="/dashboard" className="mx-2 hover:underline">
                  Dashboard
                </Link>
              )}{" "}
              {/* Assuming session.user has a role */}
              {/* Show user name/email from session data */}
              {session?.user?.email && (
                <span className="mx-2 text-sm text-gray-300">
                  Logged in as: {session.user.email}
                </span>
              )}{" "}
              {/* Assuming session.user has email */}
              {/* Use next-auth's signOut function - it clears the cookie and updates session state */}
              <button
                onClick={() => signOut()}
                className="mx-2 hover:underline focus:outline-none"
              >
                Sign Out
              </button>
            </>
          ) : (
            // --- Links for Logged-out Users ---
            <>
              {/* Show Login link only if NOT on the login page */}
              {!isLoginPage && (
                // Link to your login page
                <Link href="/login" className="mx-2 hover:underline">
                  Login
                </Link>
                // If you wanted to use signIn for a provider button directly:
                // <button onClick={() => signIn('credentials')} className="mx-2 hover:underline">Login</button>
              )}
              {/* Show Register link only if NOT on the register page */}
              {!isRegisterPage && (
                <Link href="/register" className="mx-2 hover:underline">
                  Register
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
