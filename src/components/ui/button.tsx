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
          ? 'border border-gray-300 bg-white hover:bg-gray-50'
          : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300',
        className
      )}
      {...props}
    />
  );
}
