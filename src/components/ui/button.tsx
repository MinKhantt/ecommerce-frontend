import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary hover:bg-ink-deep',
        secondary: 'bg-canvas text-ink border border-hairline-strong hover:bg-surface-soft',
        destructive: 'bg-danger text-on-dark hover:bg-danger-hover',
        outline: 'bg-canvas text-body border border-hairline hover:bg-surface-soft',
        ghost: 'text-body hover:text-ink hover:bg-surface-soft',
        link: 'text-ink underline underline-offset-2',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-5 py-1',
        lg: 'h-11 px-6 py-2 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? '...' : children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
