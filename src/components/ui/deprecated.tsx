import { cn } from '../../lib/utils';

export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <span className="text-body text-sm">...</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 text-mute">
          {icon}
        </div>
      )}
      <h3 className="font-mono font-bold text-sm text-ink">{title}</h3>
      {description && <p className="text-body text-sm mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-surface-card text-mute',
  PROCESSING: 'bg-surface-card text-mute',
  SHIPPED: 'bg-surface-card text-mute',
  DELIVERED: 'bg-success text-on-dark',
  CANCELLED: 'bg-danger text-on-dark',
  SUCCEEDED: 'bg-success text-on-dark',
  FAILED: 'bg-danger text-on-dark',
  REFUNDED: 'bg-surface-card text-mute',
  REQUIRES_ACTION: 'bg-warning text-on-dark',
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-surface-card text-mute';
  return (
    <span className={cn('inline-flex items-center rounded-sm px-2 py-0.5 text-xs', style)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-sm border border-danger bg-surface-soft px-3 py-2 text-sm text-danger" role="alert">
      {message}
    </div>
  );
}

export function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="rounded-sm border border-success bg-surface-soft px-3 py-2 text-sm text-success" role="alert">
      {message}
    </div>
  );
}
