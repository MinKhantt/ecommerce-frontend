import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { useOrder } from '../../api/hooks';
import { PageLoader, StatusBadge, Button } from '../../components/ui';
import { getOptimizedImageUrl } from '../../utils/images';
import type { Order } from '../../types';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Use order from navigation state first (immediate), fall back to API
  const stateOrder = (location.state as { order?: Order })?.order;
  const { data: fetchedOrder, isLoading } = useOrder(orderId && !stateOrder ? orderId : '');

  const order = stateOrder || fetchedOrder;

  if (!stateOrder && isLoading) return <PageLoader />;
  if (!order) return <div className="p-8 text-mute">Order not found.</div>;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-surface-soft rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-success text-3xl font-bold">[✓]</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">Order Placed!</h1>
          <p className="text-mute mt-1 text-sm">
            Order ID:{' '}
            <span className="font-mono text-body">{order.id.slice(0, 8)}…</span>
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-canvas rounded-sm border border-hairline overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-hairline flex items-center justify-between">
            <div>
              <p className="text-xs text-ash">Order date</p>
              <p className="text-sm font-medium text-body">
                {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={order.orderStatus} />
          </div>

          {/* Items */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold text-body mb-3">Items ordered</h3>
            <div className="flex flex-col gap-3">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-surface-soft rounded-sm overflow-hidden flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <img
                        src={getOptimizedImageUrl(item.product.images[0].downloadUrl, { w: 80, h: 80 })}
                        alt={item.product.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone text-xs">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-body">{item.product.name}</p>
                    <p className="text-xs text-ash">×{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-ink">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Address + Total */}
          <div className="px-6 py-4 bg-surface-soft border-t border-hairline">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-mute">Shipping to</span>
              <span className="text-body font-medium text-right max-w-[60%]">
                {order.shippingAddress}
              </span>
            </div>
            <div className="flex justify-between font-bold text-ink text-base mt-2 pt-2 border-t border-hairline">
              <span>Total</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="default"
            size="lg"
            className="flex-1"
            onClick={() => navigate(`/orders/${order.id}/payment`)}
          >
            Pay Now
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/orders')}
          >
            View My Orders
          </Button>
        </div>

        <div className="text-center mt-4">
          <Link to="/products" className="text-sm text-ash">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
