import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { useUser, useMyOrders, useLogout } from '../../api/hooks';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { PageLoader } from '../../components/ui/deprecated';

type Tab = 'overview' | 'orders' | 'addresses' | 'profile';

export default function ProfilePage() {
  const { userId, logout } = useAuthStore();
  const logoutMutation = useLogout();
  const { data: user, isLoading } = useUser(userId ?? '');
  const { data: orders = [] } = useMyOrders();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (isLoading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-mute">{user.email}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders">
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="addresses">
              Addresses
            </TabsTrigger>
            <TabsTrigger value="profile">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-sm text-stone">No orders yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <Link
                          key={order.id}
                          to={`/orders/${order.id}`}
                          className="flex items-center justify-between py-2 border-b border-hairline last:border-0"
                        >
                          <div>
                            <p className="text-xs font-mono text-mute">#{order.id.slice(0, 8)}</p>
                            <p className="text-sm font-medium text-body">${order.totalAmount.toFixed(2)}</p>
                          </div>
                          <Badge variant="outline" size="sm">
                            {order.orderStatus}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                  {orders.length > 0 && (
                    <Link to="/orders" className="text-sm text-primary font-medium mt-3 inline-block">
                      View all orders →
                    </Link>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center justify-between w-full py-2 text-sm text-body"
                  >
                    Edit profile
                    <span className="text-stone">{'[>]'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className="flex items-center justify-between w-full py-2 text-sm text-body"
                  >
                    Manage addresses
                    <span className="text-stone">{'[>]'}</span>
                  </button>
                  <hr className="border-hairline" />
                  <button
                    onClick={async () => {
                      try {
                        await logoutMutation.mutateAsync();
                      } catch {}
                      logout();
                      window.location.href = '/';
                    }}
                    className="flex items-center gap-2 w-full py-2 text-sm text-accent"
                  >
                    [x]
                    Sign out
                  </button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-3">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-mute text-sm">No orders yet.</p>
                    <Link to="/products">
                      <Button variant="default" size="sm" className="mt-4">
                        Start shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Link key={order.id} to={`/orders/${order.id}`}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-mute">#{order.id.slice(0, 8)}</span>
                            <span className="text-xs text-stone">{new Date(order.orderDate).toLocaleDateString()}</span>
                          </div>
                          <Badge variant="outline" size="sm">{order.orderStatus}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-ink">${order.totalAmount.toFixed(2)}</span>
                          <span className="text-stone">{'[>]'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="addresses">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Saved Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone">No saved addresses yet.</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Add address
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-stone font-medium uppercase tracking-wide">First Name</p>
                    <p className="text-sm text-ink mt-1">{user.firstName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone font-medium uppercase tracking-wide">Last Name</p>
                    <p className="text-sm text-ink mt-1">{user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone font-medium uppercase tracking-wide">Email</p>
                    <p className="text-sm text-ink mt-1">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
