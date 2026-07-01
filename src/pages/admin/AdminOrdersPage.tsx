import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllOrders } from '../../api/hooks';
import { PageLoader, StatusBadge } from '../../components/ui/deprecated';
import { OrderStatus } from '../../types';
import type { Order } from '../../types';

const ALL_STATUSES = Object.values(OrderStatus);

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useAllOrders();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    ALL_STATUSES.forEach((s) => map.set(s, 0));
    (orders as { orderStatus: string }[]).forEach((o) =>
      map.set(o.orderStatus, (map.get(o.orderStatus) ?? 0) + 1),
    );
    return Object.fromEntries(map) as Record<string, number>;
  }, [orders]);

  const filtered = useMemo(() => {
    return (orders as Order[]).filter((o) => {
      const matchStatus = !activeTab || o.orderStatus === activeTab;
      const matchSearch =
        !search ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.shippingAddress.toLowerCase().includes(search.toLowerCase()) ||
        `${o.user.firstName} ${o.user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        o.user.email.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, activeTab, search]);

  if (isLoading) return <PageLoader />;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Orders</h1>
          <p className="text-sm text-mute mt-0.5">{orders.length} total orders</p>
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
          All ({orders.length})
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
          placeholder="Search by ID, address, customer name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 rounded-sm border border-hairline bg-canvas text-sm text-ink focus:outline-none"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-canvas rounded-sm border border-hairline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Shipping
                </th>
                <th className="text-right px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-mute">
                      {order.id.slice(0, 8)}…
                    </span>
                    <p className="text-body text-xs mt-0.5">
                      {order.orderItems?.length ?? 0} items
                    </p>
                  </td>
                  <td className="px-5 py-4 text-mute whitespace-nowrap">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-body font-medium">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                    <p className="text-xs text-stone">{order.user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-mute max-w-[150px]">
                    <p className="line-clamp-1">{order.shippingAddress}</p>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-ink">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.orderStatus} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
