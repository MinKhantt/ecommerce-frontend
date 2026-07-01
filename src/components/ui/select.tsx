import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm text-body">
            {label}
          </label>
        )}
        <select
          id={id}
          className={cn(
            'flex h-10 w-full rounded-sm border bg-surface-soft px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink focus:bg-canvas',
            error ? 'border-danger' : 'border-hairline',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
