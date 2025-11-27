import { type ReactNode } from 'react';
import { cn } from '@/src/shared/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className,
  glass = true,
  hover = true,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-300',
        glass ? 'glass' : 'bg-background-elevated border-border',
        hover && 'hover:shadow-glow hover:border-border-hover hover:scale-[1.02]',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
