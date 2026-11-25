'use client';

import React, { useEffect } from 'react';
import Logo from '@/components/Logo';
import WebDavConfig from '@/components/WebDavConfig';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  // If still loading authentication status, show nothing
  if (status === 'loading') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-10" />
              <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        <div className="max-w-2xl mx-auto">
          <WebDavConfig />
        </div>
      </div>
    </div>
  );
}