import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCart } from './api/hooks';
import { useCartStore } from './stores/cart-store';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileNav from './components/layout/MobileNav';
import CartDrawer from './components/layout/CartDrawer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import LoginSuccessPage from './pages/auth/LoginSuccessPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProductCatalogPage from './pages/products/ProductCatalogPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import CheckoutSuccessPage from './pages/checkout/CheckoutSuccessPage';
import MyOrdersPage from './pages/orders/MyOrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ProfilePage from './pages/profile/ProfilePage';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminImagesPage from './pages/admin/AdminImagesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { data: cart } = useCart();
  const { setItems } = useCartStore();

  useEffect(() => {
    if (cart) {
      setItems(cart.cartItems ?? [], cart.totalAmount);
    }
  }, [cart, setItems]);

  if (isAdmin) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <CartDrawer />
      <main id="main-content" className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

function RedirectToCheckout() {
  return <Navigate to="/checkout" replace />;
}

function RedirectToSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  return <Navigate to={`/checkout/success/${orderId}`} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-success" element={<LoginSuccessPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={<ProductCatalogPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* Authenticated */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/success/:orderId"
              element={
                <ProtectedRoute>
                  <CheckoutSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            {/* Backward-compatible redirects */}
            <Route
              path="/orders/:orderId/payment"
              element={
                <ProtectedRoute>
                  <RedirectToCheckout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId/confirmation"
              element={
                <ProtectedRoute>
                  <RedirectToSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="images" element={<AdminImagesPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
