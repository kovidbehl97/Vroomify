// app/(routes)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react'; // Import signIn
import GoogleSignInButton from '../../_components/GoogleSignInButton'; // Assuming this component exists and handles the signIn('google') call internally or via a prop

export default function LoginPage() { // Renamed to LoginPage
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Use the signIn function with the 'credentials' provider
    const result = await signIn('credentials', {
      redirect: false, // Prevent NextAuth.js from redirecting automatically
      email,
      password,
      // callbackUrl: '/' // Optional: specify where to redirect after successful login
    });

    if (result?.error) { // Check for result and result.error
      setError(result.error); // NextAuth.js provides an error message here
    } else {
      // Login successful, redirect to the homepage or callbackUrl
      router.push('/'); // Redirect to homepage on success
      // or router.push(result?.url || '/'); // Redirect to callbackUrl if available
    }
  };

   // Assuming GoogleSignInButton component handles its own click and calls signIn('google')
   // If not, you'd have an onClick handler here calling signIn('google')

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1> {/* Added text-center */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow-md">
         <div className="mb-4">
           <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
           <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"> {/* Made button full width */}
          Log In
        </button>
      </form>

      <div className="max-w-md mx-auto mt-4 text-center"> {/* Centered Google button area */}
         <p className="mb-4">OR</p>
         {/* GoogleSignInButton component should handle its own onClick calling signIn('google') */}
         <GoogleSignInButton />
      </div>


      <p className="mt-4 text-center">
        Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Sign Up here</Link> {/* Corrected link to /signup */}
      </p>
    </div>
  );
}