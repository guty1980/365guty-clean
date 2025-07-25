
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainApp } from '@/components/main-app';
import { User } from '@/lib/types';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <MainApp user={user} />;
}
