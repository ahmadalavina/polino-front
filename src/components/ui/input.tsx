import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand',
        className
      )}
      {...props}
    />
  );
}
