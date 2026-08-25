'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';

function hasCompletedProfile(profile: unknown) {
  if (!profile || typeof profile !== 'object') return false;
  const value = profile as Record<string, unknown>;
  return Boolean(
    value.nickname ||
      value.firstName ||
      value.name ||
      value.grade ||
      value.avatarId,
  );
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      if (pathname === '/login') {
        if (!cancelled) setIsChecking(false);
        return;
      }

      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token || !refreshToken) {
        router.replace('/login');
        return;
      }

      try {
        const profile = await api.getMyProfile();
        const profileExists = hasCompletedProfile(profile);

        if (pathname === '/' && profileExists) {
          router.replace('/course');
          return;
        }

        if (pathname !== '/' && !profileExists) {
          router.replace('/');
          return;
        }

        if (!cancelled) setIsChecking(false);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          if (pathname !== '/') router.replace('/');
          else if (!cancelled) setIsChecking(false);
          return;
        }

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        router.replace('/login');
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (pathname === '/login' || !isChecking) return children;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6fbff]">
      <p className="font-bold text-slate-500">در حال بررسی حساب کاربری...</p>
    </main>
  );
}
