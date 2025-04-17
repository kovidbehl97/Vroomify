'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '../_lib/types';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data or decode token
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data.user))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const handleSignOut = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signout`, { method: 'POST' });
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/">Vroomify</Link>
        <div>
          <Link href="/cars" className="mx-2">Cars</Link>
          {user ? (
            <>
              <Link href="/history" className="mx-2">Booking History</Link>
              {user.role === 'admin' && <Link href="/dashboard" className="mx-2">Dashboard</Link>}
              <button onClick={handleSignOut} className="mx-2">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="mx-2">Login</Link>
              <Link href="/register" className="mx-2">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}