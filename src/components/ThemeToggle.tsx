'use client';

import { Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useThemeStore, resolveTheme } from '@/store/themeStore';
import { useSyncExternalStore } from 'react';

function useIsDark() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const observer = new MutationObserver(onStoreChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'class'],
      });
      return () => observer.disconnect();
    },
    () => typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark',
    () => false,
  );
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = useIsDark();
  const nextIsDark = resolveTheme(theme) === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={nextIsDark ? 'روشن‌کردن حالت نمایش' : 'تاریک‌کردن حالت نمایش'}
      title={nextIsDark ? 'حالت روشن' : 'حالت تاریک'}
      className={`grid size-11 shrink-0 place-items-center rounded-2xl border-2 border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-[#7c5cff] hover:text-[#7c5cff] ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'dark' : 'light'}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="grid place-items-center"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
