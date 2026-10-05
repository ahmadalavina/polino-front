import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        variant === 'outline'
          ? 'border border-border bg-surface hover:bg-surface-muted'
          : 'bg-brand text-brand-foreground hover:bg-brand-hover disabled:bg-border',
        className
      )}
      {...props}
    />
  );
}
