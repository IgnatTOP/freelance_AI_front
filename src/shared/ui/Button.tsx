import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/src/shared/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: 'bg-primary hover:bg-primary-dark text-background font-medium shadow-glow transition-all duration-300',
  secondary: 'bg-background-elevated hover:bg-background-secondary text-foreground border border-border transition-all duration-300',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-background transition-all duration-300',
  glass: 'glass hover:glass-strong text-foreground transition-all duration-300',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-xl font-sans disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
