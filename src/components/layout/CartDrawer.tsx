import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cart-store';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../api/hooks';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { getOptimizedImageUrl } from '../../utils/images';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { isDrawerOpen, closeDrawer } = useCartStore();
  const { data: cart } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const items = cart?.cartItems ?? [];
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const total = cart?.totalAmount ?? 0;
  const FREE_SHIPPING_THRESHOLD = 50;
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFree = FREE_SHIPPING_THRESHOLD - total;

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="text-sm font-mono">
            Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 text-sm text-body">
            <h3 className="text-ink font-medium">Your cart is empty</h3>
            <p className="text-mute mt-1">Add some products to get started.</p>
            <Button
              variant="secondary"
              size="md"
              className="mt-5"
              onClick={() => {
                closeDrawer();
                navigate('/products');
              }}
            >
              Browse products
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="px-5 pb-3">
              {shippingProgress < 100 ? (
                <div className="bg-surface-soft rounded-sm px-3 py-2 text-xs">
                  <p className="text-body">
                    Add <span className="font-bold text-ink">${remainingForFree.toFixed(2)}</span> more for free shipping
                  </p>
                  <Progress value={shippingProgress} className="mt-1.5" />
                </div>
              ) : (
                <div className="bg-surface-soft rounded-sm px-3 py-2 text-xs">
                  <p className="text-success">[x] You qualify for free shipping!</p>
                  <Progress value={100} className="mt-1.5" />
                </div>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <Link
                    to={`/products/${item.product.id}`}
                    onClick={closeDrawer}
                    className="w-12 h-12 rounded-sm overflow-hidden bg-surface-soft flex-shrink-0"
                  >
                    <img
                      src={getOptimizedImageUrl(item.product.images?.[0]?.downloadUrl, { w: 80, h: 80 })}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product.id}`}
                      onClick={closeDrawer}
                      className="text-sm text-ink no-underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-mute mt-0.5">${item.unitPrice.toFixed(2)} each</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-hairline rounded-sm overflow-hidden">
                        <button
                          onClick={() => updateItem.mutate({ productId: item.product.id, quantity: Math.max(1, item.quantity - 1) })}
                          disabled={updateItem.isPending || item.quantity <= 1}
                          className="px-2 py-0.5 text-xs text-body hover:text-ink disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          [-]
                        </button>
                        <span className="px-2 py-0.5 text-xs text-ink min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem.mutate({ productId: item.product.id, quantity: item.quantity + 1 })}
                          disabled={updateItem.isPending}
                          className="px-2 py-0.5 text-xs text-body hover:text-ink"
                          aria-label="Increase quantity"
                        >
                          [+]
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">${item.totalPrice.toFixed(2)}</span>
                        <button
                          onClick={() => removeItem.mutate(item.product.id)}
                          disabled={removeItem.isPending}
                          className="text-xs text-mute hover:text-danger"
                          aria-label="Remove item"
                        >
                          [x]
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-hairline px-5 py-3 space-y-3 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-body">Subtotal</span>
                <span className="font-medium text-ink">${total.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    closeDrawer();
                    navigate('/cart');
                  }}
                >
                  View Cart
                </Button>
                <Button
                  variant="default"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    closeDrawer();
                    navigate('/checkout');
                  }}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
