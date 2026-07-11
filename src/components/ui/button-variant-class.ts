import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-sm font-medium transition-colors duration-200 ease-motion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:opacity-90',
        secondary: 'bg-secondary text-secondary-foreground hover:opacity-90',
        outline: 'border border-divider bg-transparent text-text-primary hover:bg-surface-variant',
        ghost: 'bg-transparent text-text-primary hover:bg-surface-variant',
        destructive: 'bg-error text-white hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export function buttonVariantClass(
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' = 'primary',
) {
  return buttonVariants({ variant });
}
