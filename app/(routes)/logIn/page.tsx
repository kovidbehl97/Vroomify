// app/login/page.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import GoogleSignInButton from "../../../components/GoogleSignInButton";
import { auth } from "../../auth/firebase"; // Adjust path
import { useAuth } from "../../_context/AuthContext"; // Adjust path

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Combined loading state

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/"); // Or your default logged-in page
    }
  }, [user, authLoading, router]);

  const handleEmailLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Email login successful");
      // Redirect is handled by the useEffect checking `user` state change,
      // or you can explicitly push here: router.push('/dashboard');
    } catch (err: any) {
      console.error("Email Login Error:", err);
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential": // Catches both wrong email/password in newer SDK versions
          setError("Invalid email or password.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render the form if initial auth check is loading or user is already logged in
  if (authLoading || user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
      <h2>Login</h2>
      {/* Email/Password Form */}
      <form onSubmit={handleEmailLogin}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email:</label>
          <br />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password:</label>
          <br />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            cursor: loading ? "not-allowed" : "pointer",
            width: "100%",
          }}
        >
          {loading ? "Logging in..." : "Login with Email"}
        </button>
      </form>

      <hr style={{ margin: "1.5rem 0" }} />

      {/* Google Sign-In Button */}
      <GoogleSignInButton
        onError={setError}
        onSuccess={() => {
          console.log("Google login successful");
          // Redirect is handled by the useEffect checking `user` state change,
          // or you can explicitly push here: router.push('/dashboard');
        }}
        loading={loading}
        setLoading={setLoading}
      />

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      <p style={{ marginTop: "1rem" }}>
        Don't have an account?{" "}
        <Link href="/signUp" style={{ textDecoration: "underline" }}>
          Sign up here
        </Link>
      </p>
    </div>
  );
}
