import type { ReactNode } from 'react';

export function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-2 block text-xs font-bold text-rose-500">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-2 block text-xs font-medium leading-5 text-slate-400">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
