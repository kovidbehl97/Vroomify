// app/signup/page.tsx
"use client"; // Required for hooks like useState, useRouter, useEffect, useAuth

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import GoogleSignInButton from "../../../components/GoogleSignInButton"; // Adjust path as needed
import { auth } from "../../auth/firebase"; // Adjust path as needed
import { useAuth } from "../../_context/AuthContext"; // Adjust path as needed

export default function SignupPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state for submission

  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/"); // Or your desired logged-in destination
    }
  }, [user, authLoading, router]);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors

    // Basic Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    setLoading(true); // Start loading indicator

    try {
      // Attempt to create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Signup successful:", userCredential.user);
      // Redirect upon successful signup
      // The onAuthStateChanged listener in AuthContext will handle the user state update,
      // and the useEffect above might handle redirect, or you can push here.
      router.push("/dashboard"); // Example: Redirect to dashboard after signup
    } catch (err: any) {
      // Catch specific Firebase errors
      console.error("Signup Error:", err);
      // Provide user-friendly error messages
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email address is already registered.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Please choose a stronger password.");
          break;
        default:
          setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // Stop loading indicator regardless of outcome
    }
  };

  // Don't render the form if initial auth check is loading or user is already logged in
  if (authLoading || user) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // Render the signup form
  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
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
            minLength={6} // Basic HTML5 validation
            disabled={loading}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <br />
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            cursor: loading ? "not-allowed" : "pointer",
            width: "100%",
          }}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        Already have an account?{" "}
        <Link href="/logIn" style={{ textDecoration: "underline" }}>
          Login here
        </Link>
      </p>
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
    </div>
  );
}
