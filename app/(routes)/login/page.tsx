"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import GoogleSignInButton from "../../_components/GoogleSignInButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl underline font-black text-black mb-6 text-center">
        Log In
      </h1>

      <div className="max-w-md mx-auto p-6 shadow-md border border-gray-100">
        <form onSubmit={handleSubmit} className=" bg-white ">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-2 w-full"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-black font-bold text-white px-4 h-[47px] cursor-pointer "
          >
            Log In
          </button>
        </form>

        <p className="my-4 w-full text-center">OR</p>

        <GoogleSignInButton />
      </div>
      <p className="mt-4 text-center">
        Don&apos;t have an account?
        <Link
          href="/register"
          className="text-gray-700 font-black hover:underline ml-1"
        >
          Sign Up Here
        </Link>
      </p>
    </div>
  );
}
