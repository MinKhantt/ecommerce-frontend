import { Link } from 'react-router-dom';
import { useMyOrders } from '../../api/hooks';
import { PageLoader, EmptyState, StatusBadge, Button } from '../../components/ui';
import { getOptimizedImageUrl } from '../../utils/images';
import type { Order } from '../../types';

export default function MyOrdersPage() {
  const { data: orders = [], isLoading } = useMyOrders();

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-ink mb-8">My Orders</h1>

        {isLoading ? (
          <PageLoader />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Place your first order to see it here."
            action={
              <Link to="/products">
                <Button variant="default">Start shopping</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {(orders as Order[]).map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block bg-white rounded-sm border border-hairline p-5"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-stone font-mono mb-1">{order.id.slice(0, 8)}…</p>
                    <p className="text-sm font-semibold text-body">
                      {order.orderItems?.length ?? 0} item{order.orderItems?.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-stone mt-0.5">
                      {new Date(order.orderDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.orderStatus} />
                    <p className="font-bold text-ink">${order.totalAmount.toFixed(2)}</p>
                    <span className="text-stone">{'[>]'}</span>
                  </div>
                </div>

                {/* Item thumbnails */}
                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    {order.orderItems.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="w-9 h-9 rounded-sm bg-surface-soft overflow-hidden border border-hairline"
                      >
                        {item.product.images?.[0] ? (
                          <img
                            src={getOptimizedImageUrl(item.product.images[0].downloadUrl, { w: 72, h: 72 })}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ash text-[8px]">
                            ?
                          </div>
                        )}
                      </div>
                    ))}
                    {order.orderItems.length > 5 && (
                      <div className="w-9 h-9 rounded-sm bg-surface-card flex items-center justify-center text-xs text-mute font-medium">
                        +{order.orderItems.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
