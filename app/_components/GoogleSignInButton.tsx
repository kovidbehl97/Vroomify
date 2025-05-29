"use client";

import { signIn } from "next-auth/react";

interface GoogleSignInButtonProps {
  onError?: (error: string) => void;
  onSuccess?: () => void;
  loading?: boolean;
}

const GoogleSignInButton = ({
  onError,
  onSuccess,
  loading,
}: GoogleSignInButtonProps) => {
  const handleGoogleLogin = async () => {
    loading = true;

    try {
      const result = await signIn("google", {
        callbackUrl: "/",
      });
      if (result?.error) {
        console.error("Google signIn returned an error:", result.error);
        if (onError) {
          onError("Failed to sign in with Google: " + result.error);
        }
      } else {
        if (onSuccess && result?.ok) {
          onSuccess();
          loading = false;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (onError) {
          onError(
            "An unexpected error occurred during Google sign in: " + err.message
          );
        }
      } else {
        if (onError) {
          onError("An unexpected error occurred during Google sign in.");
        }
      }
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      style={{
        cursor: loading ? "not-allowed" : "pointer",
        border: "none",
        display: "flex",
        gap: "0.5rem",
      }}
      className=" bg-[#f2f2f2]  mt-5 text-white w-full flex items-center justify-between shadow-md shadow-gray-200 border border-gray-200"
    >
      <div className="h-[47px] w-[47px] flex items-center bg-[#f2f2f2] justify-center">
        <span className="h-[47px] w-[47px] bg-[url(/google-btn.png)] bg-contain bg-no-repeat bg-center"></span>
      </div>
      <span className="flex w-full justify-center text-gray-600 mr-5 font-bold">
        {loading ? "Signing in..." : "Sign in with Google"}
      </span>
    </button>
  );
};

export default GoogleSignInButton;
