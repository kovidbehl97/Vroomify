'use client';

import React, { useState } from 'react';
import { signUpWithEmail, signInWithGoogle } from '../../auth/auth';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await signUpWithEmail(email, password);
    if (error) {
      setError(error.message);
    } else {
      alert('Check your email for confirmation!');
    }
  };

  const handleGoogleSignUp = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
    // No success alert needed here; Supabase redirects to Google
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4">
          <button
            onClick={handleGoogleSignUp}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Sign Up with Google
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default SignUpPage;