// components/GoogleSignInButton.tsx
'use client';

import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../auth/firebase';


interface GoogleSignInButtonProps {
  onError?: (error: string) => void;
  onSuccess?: () => void; // Optional success callback
  loading?: boolean;
  setLoading?: (isLoading: boolean) => void;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onError, onSuccess, loading, setLoading }) => {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    if (setLoading) {
      setLoading(true);
    }

    try {
      await signInWithPopup(auth, provider);
      console.log('Google login successful');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Google Login Error:', err);
      if (onError) {
        if (err.code !== 'auth/popup-closed-by-user') {
          onError('Failed to sign in with Google. Please try again.');
        }
      }
    } finally {
      if (setLoading) {
        setLoading(false);
      }
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      style={{
        padding: '0.75rem 1.5rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        width: '100%',
        background: '#4285F4',
        color: 'white',
        border: 'none',
      }}
    >
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
};

export default GoogleSignInButton;