import { useParams, Link } from 'react-router-dom';
import { useAdminOrder, useUpdateOrderStatus } from '../../api/hooks';
import { PageLoader, StatusBadge, ErrorMessage } from '../../components/ui/deprecated';
import { getOptimizedImageUrl } from '../../utils/images';
import { OrderStatus } from '../../types';
import { useState } from 'react';

const ALL_STATUSES = Object.values(OrderStatus);

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading } = useAdminOrder(orderId!);
  const updateStatus = useUpdateOrderStatus();
  const [error, setError] = useState('');

  const handleStatusChange = async (status: string) => {
    if (!orderId) return;
    setError('');
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update status.';
      setError(msg);
    }
  };

  if (isLoading) return <PageLoader />;
  if (!order) return <p className="text-mute py-8 text-center">Order not found.</p>;

  return (
    <div className="max-w-4xl">
      {/* Back link */}
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-mute mb-6"
      >
        [&lt;] Back to orders
      </Link>

      {/* Error */}
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-mute mt-0.5">
            Placed on {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.orderStatus} />
          <select
            value={order.orderStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 text-sm rounded-sm border border-hairline bg-canvas text-body focus:outline-none"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Info */}
        <div className="bg-canvas rounded-sm border border-hairline p-5">
          <h3 className="font-semibold text-ink mb-3">
            Customer
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-body">
                {order.user.firstName} {order.user.lastName}
              </p>
              <p className="text-xs text-stone">{order.user.email}</p>
            </div>
            <div className="pt-2 border-t border-hairline">
              <p className="text-xs text-stone">User ID</p>
              <p className="text-xs font-mono text-mute">{order.user.id}</p>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-canvas rounded-sm border border-hairline p-5">
          <h3 className="font-semibold text-ink mb-3">
            Order Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone">ID</span>
              <span className="font-mono text-xs text-mute">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone">Date</span>
              <span className="text-body">{new Date(order.orderDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone">Items</span>
              <span className="text-body">{order.orderItems?.length ?? 0}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-hairline">
              <span className="text-body font-semibold">Total</span>
              <span className="text-ink font-bold">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-canvas rounded-sm border border-hairline p-5">
          <h3 className="font-semibold text-ink mb-3">
            Shipping
          </h3>
          <p className="text-sm text-body">{order.shippingAddress}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-canvas rounded-sm border border-hairline overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline">
          <h3 className="font-semibold text-ink">Order Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-5 py-3 font-semibold text-body text-xs uppercase tracking-wider">Product</th>
                <th className="text-center px-5 py-3 font-semibold text-body text-xs uppercase tracking-wider">Qty</th>
                <th className="text-right px-5 py-3 font-semibold text-body text-xs uppercase tracking-wider">Price</th>
                <th className="text-right px-5 py-3 font-semibold text-body text-xs uppercase tracking-wider">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {order.orderItems?.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {item.product.images?.[0] && (
                        <img
                          src={getOptimizedImageUrl(item.product.images[0].downloadUrl, { w: 80, h: 80 })}
                          alt=""
                          loading="lazy"
                          className="w-10 h-10 rounded-sm object-cover flex-shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-medium text-body">{item.product.name}</p>
                        <p className="text-xs text-stone">{item.product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center text-body">{item.quantity}</td>
                  <td className="px-5 py-3.5 text-right text-body">${item.price.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-ink">
                    ${(item.quantity * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
              {(!order.orderItems || order.orderItems.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-stone">No items</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-hairline bg-surface-soft">
                <td colSpan={3} className="px-5 py-3.5 text-right font-semibold text-body">
                  Total
                </td>
                <td className="px-5 py-3.5 text-right font-bold text-ink">
                  ${order.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
