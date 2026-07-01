import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '../../api/hooks';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Progress } from '../../components/ui/progress';
import { PageLoader, EmptyState } from '../../components/ui/deprecated';
import { getOptimizedImageUrl } from '../../utils/images';
import type { CartItem } from '../../types';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const [couponCode, setCouponCode] = useState('');

  if (isLoading) return <PageLoader />;

  const items: CartItem[] = cart?.cartItems ?? [];
  const total = cart?.totalAmount ?? 0;
  const FREE_SHIPPING_THRESHOLD = 50;
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFree = FREE_SHIPPING_THRESHOLD - total;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="font-mono text-2xl sm:text-3xl font-bold text-ink mb-6">
          Shopping Cart
          {items.length > 0 && (
            <span className="text-base font-normal text-ash ml-2">
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Add some products to get started."
            action={
              <Button variant="default" onClick={() => navigate('/products')}>
                Browse products
              </Button>
            }
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const imageUrl = getOptimizedImageUrl(item.product.images?.[0]?.downloadUrl, { w: 80, h: 80 });
                return (
                  <div
                    key={item.id}
                    className="bg-canvas rounded-sm border border-hairline p-4 flex items-center gap-4"
                  >
                    <Link to={`/products/${item.product.id}`}>
                      <div className="w-16 h-16 rounded-sm overflow-hidden bg-surface-card flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={item.product.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-primary uppercase tracking-wide">
                        {item.product.brand}
                      </p>
                      <Link
                        to={`/products/${item.product.id}`}
                        className="text-sm font-semibold text-ink line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-ash mt-0.5">{item.product.category.name}</p>
                      <p className="text-xs text-ash">${item.unitPrice.toFixed(2)} each</p>
                    </div>

                    {/* Quantity stepper */}
                    <div className="flex items-center border border-hairline rounded-sm overflow-hidden">
                      <button
                        onClick={() =>
                          updateItem.mutate(
                            { productId: item.product.id, quantity: Math.max(1, item.quantity - 1) },
                            { onSuccess: () => toast.success('Cart updated') }
                          )
                        }
                        disabled={updateItem.isPending || item.quantity <= 1}
                        className="px-2.5 py-2 text-mute"
                        aria-label="Decrease quantity"
                      >
                        [-]
                      </button>
                      <span className="px-3 py-2 text-sm font-medium text-ink min-w-[2rem] text-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateItem.mutate(
                            { productId: item.product.id, quantity: item.quantity + 1 },
                            { onSuccess: () => toast.success('Cart updated') }
                          )
                        }
                        disabled={updateItem.isPending}
                        className="px-2.5 py-2 text-mute"
                        aria-label="Increase quantity"
                      >
                        [+]
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right w-20 flex-shrink-0">
                      <p className="font-bold text-ink">${item.totalPrice.toFixed(2)}</p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() =>
                        removeItem.mutate(item.product.id, {
                          onSuccess: () => toast.success('Item removed from cart'),
                        })
                      }
                      disabled={removeItem.isPending}
                      className="text-ash p-1 flex-shrink-0"
                      aria-label="Remove item"
                    >
                      [x]
                    </button>
                  </div>
                );
              })}

              {items.length > 1 && (
                <button
                  onClick={() => {
                    clearCart.mutate(undefined, {
                      onSuccess: () => toast.success('Cart cleared'),
                    });
                  }}
                  className="text-sm text-ash"
                >
                  Clear cart
                </button>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-canvas rounded-sm border border-hairline p-6 sticky top-20 space-y-4">
                <h2 className="font-mono text-lg font-semibold text-ink">Order Summary</h2>

                {/* Free shipping progress */}
                {shippingProgress < 100 ? (
                  <div className="bg-surface-soft rounded-sm px-4 py-3 text-sm">
                    <p className="text-body font-medium">
                      Add <span className="font-bold">${remainingForFree.toFixed(2)}</span> more for free shipping
                    </p>
                    <Progress value={shippingProgress} className="mt-2" />
                  </div>
                ) : (
                  <div className="bg-surface-soft rounded-sm px-4 py-3 text-sm">
                    <p className="text-success font-medium">✓ You qualify for free shipping!</p>
                    <Progress value={100} className="mt-2" />
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-mute">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-mute">
                    <span>Shipping</span>
                    <span className="text-success font-medium">
                      {total >= FREE_SHIPPING_THRESHOLD ? 'Free' : 'Calculated at checkout'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-ink text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon code */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-sm border border-hairline text-sm outline-none"
                    />
                  </div>
                  <Button variant="outline" size="md" disabled={!couponCode}>
                    Apply
                  </Button>
                </div>

                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </Button>

                <Link
                  to="/products"
                  className="block text-center text-sm text-ash"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
