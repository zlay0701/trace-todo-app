'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { TaskProvider } from '../contexts/TaskContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TaskProvider>{children}</TaskProvider>
    </SessionProvider>
  );
}