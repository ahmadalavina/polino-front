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
      <span className="mb-2 block text-sm font-black text-foreground">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-2 block text-xs font-bold text-danger">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-2 block text-xs font-medium leading-5 text-subtle">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
