import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function GradientHeroCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-card p-6 text-white shadow-sm',
        'bg-gradient-to-br from-primary to-secondary',
        className,
      )}
    >
      {children}
    </div>
  );
}
