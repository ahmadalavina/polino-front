'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [validatedPathname, setValidatedPathname] = useState<string | null>(
    null,
  );

  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setProfile = useAuthStore((state) => state.setProfile);
  const logout = useAuthStore((state) => state.logout);
  const hasCompletedProfile = useAuthStore(
    (state) => state.hasCompletedProfile,
  );

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      if (pathname === '/login') {
        return;
      }

      if (!hydrated) {
        return;
      }

      if (!token || !refreshToken) {
        if (!cancelled) {
          router.replace('/login');
        }
        return;
      }

      try {
        const apiProfile = await api.getMyProfile();
        if (apiProfile && !cancelled) {
          setProfile(apiProfile);
        }
        const profileExists = hasCompletedProfile(apiProfile);

        if (pathname === '/' && profileExists) {
          if (!cancelled) {
            router.replace('/course');
          }
          return;
        }

        if (pathname !== '/' && !profileExists) {
          if (!cancelled) {
            router.replace('/');
          }
          return;
        }

        if (!cancelled) setValidatedPathname(pathname);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          if (!cancelled) {
            if (pathname !== '/') {
              router.replace('/');
            } else {
              setValidatedPathname(pathname);
            }
          }
          return;
        }

        if (!cancelled) {
          logout();
          router.replace('/login');
        }
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, [
    pathname,
    router,
    token,
    refreshToken,
    logout,
    setProfile,
    hasCompletedProfile,
    hydrated,
  ]);
  
  if (pathname === '/login' || validatedPathname === pathname) return children;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6fbff]">
      <p className="font-bold text-slate-500">در حال بررسی حساب کاربری...</p>
    </main>
  );
}
