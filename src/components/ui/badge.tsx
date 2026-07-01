import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2 py-0.5 text-xs',
  {
    variants: {
      variant: {
        default: 'bg-ink text-on-dark',
        secondary: 'bg-surface-card text-mute',
        destructive: 'bg-danger text-on-dark',
        warning: 'bg-warning text-on-dark',
        outline: 'border border-hairline text-body',
        success: 'bg-success text-on-dark',
        info: 'bg-surface-card text-mute',
        purple: 'bg-surface-card text-mute',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2 py-0.5 text-xs',
        lg: 'px-2.5 py-0.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
