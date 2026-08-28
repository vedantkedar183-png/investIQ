'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// The AuthGate handles login/register for unauthenticated users.
// If someone navigates to /register while already authenticated, redirect to home.
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
