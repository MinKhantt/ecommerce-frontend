import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { useAddToCart } from '../../api/hooks';
import { useCartStore } from '../../stores/cart-store';
import { Badge } from './badge';
import { getOptimizedImageUrl, PLACEHOLDER_IMG } from '../../utils/images';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const addToCart = useAddToCart();
  const { openDrawer } = useCartStore();

  const imageUrl = getOptimizedImageUrl(product.images?.[0]?.downloadUrl, { w: 400, h: 500 });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      { onSuccess: () => openDrawer() }
    );
  };

  const inStock = product.inventory > 0;
  const isLowStock = inStock && product.inventory <= 5;

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="bg-canvas border border-hairline">
        {/* Image container — 4:5 aspect ratio */}
        <div className="relative aspect-[4/5] bg-surface-soft overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
            }}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {!inStock && (
              <Badge variant="destructive" size="sm">Out of Stock</Badge>
            )}
            {isLowStock && (
              <Badge variant="warning" size="sm">Only {product.inventory} left</Badge>
            )}
          </div>

          {/* Quick-add button */}
          {inStock && (
            <button
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className="absolute bottom-2 right-2 px-2 py-1 rounded-sm bg-primary text-on-dark text-xs hover:bg-ink-deep"
              aria-label="Quick add to cart"
            >
              {addToCart.isPending ? '...' : '[+]'}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-mute truncate">
            {product.brand}
          </p>
          <h3 className="text-ink font-medium text-sm mt-0.5 leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-mute mt-1">{product.category.name}</p>

          <div className="flex items-center justify-between mt-2">
            <p className="text-ink font-bold text-base">
              ${product.price.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
