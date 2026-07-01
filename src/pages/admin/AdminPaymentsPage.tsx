import { useState, useMemo } from 'react';
import { useAllPayments, useUpdatePaymentStatus } from '../../api/hooks';
import { PageLoader, StatusBadge, Button } from '../../components/ui';
import { PaymentStatus } from '../../types';
import type { Payment } from '../../types';

const ALL_STATUSES = Object.values(PaymentStatus);

export default function AdminPaymentsPage() {
  const { data: payments = [], isLoading } = useAllPayments();
  const updateStatus = useUpdatePaymentStatus();
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    ALL_STATUSES.forEach((s) => map.set(s, 0));
    (payments as { paymentStatus: string }[]).forEach((p) =>
      map.set(p.paymentStatus, (map.get(p.paymentStatus) ?? 0) + 1),
    );
    return Object.fromEntries(map) as Record<string, number>;
  }, [payments]);

  const filtered = useMemo(() => {
    return (payments as Payment[]).filter((p) => {
      const matchStatus = !activeTab || p.paymentStatus === activeTab;
      const matchSearch =
        !search ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        (p.transactionId ?? '').toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [payments, activeTab, search]);

  const handleRefund = async () => {
    if (!refundTarget) return;
    await updateStatus.mutateAsync({ paymentId: refundTarget.id, status: PaymentStatus.REFUNDED });
    setRefundTarget(null);
  };

  if (isLoading) return <PageLoader />;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Payments</h1>
          <p className="text-sm text-mute mt-0.5">{payments.length} total payments</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button
          onClick={() => setActiveTab('')}
          className={`px-3.5 py-2 text-sm font-medium rounded-sm ${
            activeTab === ''
              ? 'bg-primary text-on-primary'
              : 'bg-canvas text-mute border border-hairline'
          }`}
        >
          All ({payments.length})
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={`px-3.5 py-2 text-sm font-medium rounded-sm ${
              activeTab === s
                ? 'bg-primary text-on-primary'
                : 'bg-canvas text-mute border border-hairline'
            }`}
          >
            {s.replace(/_/g, ' ')} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by ID or transaction…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 rounded-sm border border-hairline bg-canvas text-sm text-ink focus:outline-none"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-canvas rounded-sm border border-hairline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Method
                </th>
                <th className="text-right px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs text-mute">
                      {payment.id.slice(0, 8)}…
                    </p>
                    {payment.stripePaymentIntentId && (
                      <p className="font-mono text-[10px] text-stone mt-0.5 truncate max-w-[120px]">
                        {payment.stripePaymentIntentId}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs text-mute">
                      {payment.order?.id?.slice(0, 8) ?? '—'}…
                    </p>
                    {payment.order?.totalAmount != null && (
                      <p className="text-xs text-stone">
                        ${payment.order.totalAmount.toFixed(2)}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-mute whitespace-nowrap">
                    {payment.paymentDate
                      ? new Date(payment.paymentDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-5 py-4 text-mute text-xs">
                    {payment.paymentMethod?.replace(/_/g, ' ') ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-ink">
                    ${payment.amount.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-stone uppercase">
                      {payment.currency}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={payment.paymentStatus} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={payment.paymentStatus}
                        onChange={(e) =>
                          updateStatus.mutate({ paymentId: payment.id, status: e.target.value })
                        }
                        className="px-2.5 py-1.5 text-xs rounded-sm border border-hairline bg-canvas text-body focus:outline-none"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {payment.paymentStatus === PaymentStatus.SUCCEEDED && (
                        <button
                          onClick={() => setRefundTarget(payment)}
                          className="text-xs px-2.5 py-1.5 rounded-sm border border-hairline text-warning"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Confirmation Modal */}
      {refundTarget && (
        <div className="fixed inset-0 bg-surface-dark/50 z-50 flex items-center justify-center p-4">
          <div className="bg-canvas rounded-sm w-full max-w-sm p-6">
            <h3 className="font-bold text-ink mb-2">Confirm Refund</h3>
            <p className="text-sm text-body mb-1">
              Refund <span className="font-semibold">${refundTarget.amount.toFixed(2)}</span> for
              payment
            </p>
            <p className="text-xs font-mono text-stone mb-4">{refundTarget.id}</p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleRefund}
                loading={updateStatus.isPending}
                className="flex-1"
              >
                Confirm Refund
              </Button>
              <Button variant="ghost" onClick={() => setRefundTarget(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
