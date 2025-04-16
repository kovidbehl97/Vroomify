"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";

function NavBar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!user); // Update login status based on user object
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      router.push("/"); // Redirect to login page after sign out
    } catch (error: any) {
      console.error("Error signing out:", error);
      // Optionally display an error message to the user
    }
  };

  // Don't render the navbar on login and signup pages
  // if (pathname === "/signUp" || pathname === "/logIn") {
  //   return null;
  // }

  return (
    <div
      className={`absolute top-0 left-0 w-full h-[100px] flex justify-between items-center px-20 z-[1]`}
    >
      <div>Vroomify</div>
      <ul>
        {isLoggedIn ? (
          <li>
            <button
              onClick={handleSignOut}
              style={{
                cursor: "pointer",
                border: "none",
                background: "none",
                padding: 0,
              }}
            >
              Sign Out
            </button>
          </li>
        ) : (
          <li>
            <Link
              href={
                pathname === "/signUp" || pathname === "/logIn" ? "/" : "/logIn"
              }
            >
              {pathname === "/signUp" || pathname === "/logIn"
                ? "Home"
                : "LogIn"}
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

export default NavBar;
