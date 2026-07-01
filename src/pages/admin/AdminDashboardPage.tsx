import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { useProducts, useAllOrders, useAllUsers } from '../../api/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageLoader } from '../../components/ui/deprecated';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export default function AdminDashboardPage() {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();
  const { data: users = [], isLoading: usersLoading } = useAllUsers();

  const today = new Date().toDateString();

  const kpis = useMemo(() => {
    const totalRevenue = orders.reduce((sum: number, o: { totalAmount: number }) => sum + o.totalAmount, 0);
    const ordersToday = orders.filter((o: { orderDate: string }) => new Date(o.orderDate).toDateString() === today).length;
    const pendingOrders = orders.filter((o: { orderStatus: string }) => o.orderStatus === 'PENDING').length;
    const outOfStock = products.filter((p: { inventory: number }) => p.inventory === 0).length;
    return { totalRevenue, ordersToday, pendingOrders, outOfStock };
  }, [orders, products, today]);

  const revenueChart = useMemo(() => {
    const last30 = new Date();
    last30.setDate(last30.getDate() - 29);
    const labels: string[] = [];
    const data: number[] = [];
    const map = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(last30);
      d.setDate(d.getDate() + i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(key);
      map.set(key, 0);
    }
    orders.forEach((o: { orderDate: string; totalAmount: number }) => {
      const key = new Date(o.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (map.has(key)) map.set(key, map.get(key)! + o.totalAmount);
    });
    map.forEach((v) => data.push(Math.round(v * 100) / 100));
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data,
          borderColor: '#30d158',
          backgroundColor: 'rgba(48, 209, 88, 0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#30d158',
          borderWidth: 2,
        },
      ],
    };
  }, [orders]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9a9898', font: { size: 11 } },
      },
      y: {
        grid: { color: '#f1eeee' },
        ticks: { color: '#9a9898', font: { size: 11 }, callback: (value: string | number) => `$${value}` },
      },
    },
    interaction: { intersect: false, mode: 'index' as const },
  };

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a: { orderDate: string }, b: { orderDate: string }) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, 5),
    [orders],
  );

  const topProducts = useMemo(() => {
    const sales = new Map<string, { name: string; qty: number; revenue: number }>();
    orders.forEach((o: { orderItems?: { product: { id: string; name: string }; quantity: number; price: number }[] }) =>
      o.orderItems?.forEach((item) => {
        const existing = sales.get(item.product.id);
        if (existing) {
          existing.qty += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          sales.set(item.product.id, {
            name: item.product.name,
            qty: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
      }),
    );
    return Array.from(sales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  if (productsLoading || ordersLoading || usersLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mono text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-mute mt-0.5">Overview of your store performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={`$${kpis.totalRevenue.toFixed(2)}`}
          subtitle={`${orders.length} total orders`}
        />
        <KpiCard
          title="Orders Today"
          value={String(kpis.ordersToday)}
          subtitle={`${kpis.pendingOrders} pending`}
        />
        <KpiCard
          title="Products"
          value={String(products.length)}
          subtitle={`${kpis.outOfStock} out of stock`}
        />
        <KpiCard
          title="Customers"
          value={String(users.length)}
          subtitle="Registered users"
        />
      </div>

      {/* Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <Line data={revenueChart} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <Link to="/admin/orders" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order: { id: string; totalAmount: number; orderStatus: string }) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
                  <div>
                    <p className="text-xs font-mono text-mute">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm font-medium text-body">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <Badge variant="outline" size="sm">{order.orderStatus}</Badge>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-sm text-stone text-center py-6">No orders yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left pb-3 font-semibold text-mute text-xs uppercase tracking-wider">#</th>
                  <th className="text-left pb-3 font-semibold text-mute text-xs uppercase tracking-wider">Product</th>
                  <th className="text-right pb-3 font-semibold text-mute text-xs uppercase tracking-wider">Units Sold</th>
                  <th className="text-right pb-3 font-semibold text-mute text-xs uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {topProducts.map((p, i) => (
                  <tr key={p.name}>
                    <td className="py-3 text-stone font-medium">{i + 1}</td>
                    <td className="py-3 text-body font-medium">{p.name}</td>
                    <td className="py-3 text-right text-body">{p.qty}</td>
                    <td className="py-3 text-right font-semibold text-ink">${p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-stone">
                      No sales data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-mute">{title}</p>
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="text-xs text-stone mt-0.5">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
