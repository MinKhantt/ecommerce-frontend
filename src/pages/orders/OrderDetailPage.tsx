import { useParams, Link } from 'react-router-dom';
import { useOrder, useCancelOrder, useMyPayments } from '../../api/hooks';
import { PageLoader, StatusBadge, Button, ErrorMessage } from '../../components/ui';
import { getOptimizedImageUrl } from '../../utils/images';
import { OrderStatus, PaymentProvider, PaymentMethod } from '../../types';
import { useState, useMemo } from 'react';

const PROVIDER_LABELS: Record<string, { label: string }> = {
  [PaymentProvider.STRIPE]: {
    label: 'Stripe',
  },
  [PaymentProvider.K_PAY]: {
    label: 'Digital Wallet',
  },
  [PaymentProvider.CASH_ON_DELIVERY]: {
    label: 'Cash on Delivery',
  },
};

const METHOD_LABELS: Record<string, string> = {
  [PaymentMethod.CREDIT_CARD]: 'Credit / Debit Card',
  [PaymentMethod.DEBIT_CARD]: 'Debit Card',
  [PaymentMethod.DIGITAL_WALLET]: 'Digital Wallet',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
  [PaymentMethod.CASH_ON_DELIVERY]: 'Cash on Delivery',
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, refetch } = useOrder(orderId ?? '');
  const { data: payments = [] } = useMyPayments();
  const cancelOrder = useCancelOrder();
  const [cancelError, setCancelError] = useState('');

  const payment = useMemo(
    () => payments.find((p) => p.order?.id === orderId),
    [payments, orderId],
  );
  const providerInfo = payment ? PROVIDER_LABELS[payment.paymentProvider] : null;
  const methodLabel = payment ? METHOD_LABELS[payment.paymentMethod] ?? payment.paymentMethod : null;

  const handleCancel = async () => {
    if (!orderId) return;
    if (!confirm('Cancel this order?')) return;
    setCancelError('');
    try {
      await cancelOrder.mutateAsync(orderId);
      await refetch();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to cancel order.';
      setCancelError(msg);
    }
  };

  if (isLoading) return <PageLoader />;
  if (!order)
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorMessage message="Order not found." />
        <Link to="/orders" className="text-primary text-sm mt-4 inline-block">
          ← My orders
        </Link>
      </div>
    );

  const canCancel =
    order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.PROCESSING;

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back */}
        <Link
          to="/orders"
          className="text-sm text-stone inline-flex items-center gap-1 mb-6"
        >
          {'[<]'} My orders
        </Link>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">Order Details</h1>
            <p className="text-xs text-stone font-mono mt-0.5">{order.id}</p>
          </div>
          <StatusBadge status={order.orderStatus} />
        </div>

        {cancelError && <ErrorMessage message={cancelError} />}

        {/* Order Card */}
        <div className="bg-white rounded-sm border border-hairline overflow-hidden mb-4">
          {/* Meta */}
          <div className="px-6 py-4 border-b border-hairline grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-stone">Order date</p>
              <p className="font-medium text-body">
                {new Date(order.orderDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            {payment && (
              <div>
                <p className="text-xs text-stone">Payment</p>
                <p className="font-medium text-body flex items-center gap-1.5 mt-0.5">
                  {providerInfo ? providerInfo.label : payment.paymentProvider}
                </p>
                {methodLabel && (
                  <p className="text-xs text-mute mt-0.5">{methodLabel}</p>
                )}
              </div>
            )}
            <div>
              <p className="text-xs text-stone">Shipping to</p>
              <p className="font-medium text-body">{order.shippingAddress}</p>
            </div>
            {payment && payment.paymentStatus && (
              <div>
                <p className="text-xs text-stone">Payment status</p>
                <StatusBadge status={payment.paymentStatus} />
              </div>
            )}
          </div>

          {/* Items */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold text-body mb-3">Items</h3>
            <div className="flex flex-col divide-y divide-hairline">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-12 h-12 bg-surface-soft rounded-sm overflow-hidden flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <img
                        src={getOptimizedImageUrl(item.product.images[0].downloadUrl, { w: 80, h: 80 })}
                        alt={item.product.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-card rounded-sm" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product.id}`}
                      className="text-sm font-medium text-body line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-stone">
                      {item.product.brand} · ×{item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-ink text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="px-6 py-4 bg-surface-soft border-t border-hairline flex justify-between font-bold text-ink">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          {canCancel && (
            <Button
              variant="outline"
              size="lg"
              loading={cancelOrder.isPending}
              onClick={handleCancel}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
