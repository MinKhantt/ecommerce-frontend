import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct, useAddToCart } from '../../api/hooks';
import { useAuthStore } from '../../stores/auth-store';
import { useCartStore } from '../../stores/cart-store';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { PageLoader, ErrorMessage } from '../../components/ui/deprecated';
import { getOptimizedImageUrl, PLACEHOLDER_IMG } from '../../utils/images';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { data: product, isLoading, isError } = useProduct(id ?? '');
  const addToCart = useAddToCart();
  const { openDrawer } = useCartStore();

  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    await addToCart.mutateAsync({ productId: id!, quantity: qty });
    setAddedFeedback(true);
    openDrawer();
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  if (isLoading) return <PageLoader />;
  if (isError || !product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorMessage message="Product not found." />
        <Link to="/products" className="text-ink text-sm mt-4 inline-block underline">
          ← Back to products
        </Link>
      </div>
    );

  const images = product.images?.length > 0 ? product.images : [];
  const mainImageUrl = getOptimizedImageUrl(images[selectedImage]?.downloadUrl, { w: 600, crop: 'limit' });
  const inStock = product.inventory > 0;
  const isLowStock = inStock && product.inventory <= 5;

  const trustSignals = [
    'Free shipping on orders over $50',
    'Secure checkout with SSL encryption',
    '30-day easy return policy',
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-mute mb-6 flex items-center gap-2" aria-label="Breadcrumb">
          <Link to="/products" className="hover:text-ink">Products</Link>
          <span>&gt;</span>
          <span className="text-body">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images — 55% */}
          <div>
            <div className="aspect-square bg-canvas border border-hairline mb-3">
              <img
                src={mainImageUrl}
                alt={product.name}
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`w-14 h-14 rounded-sm overflow-hidden border-2 ${
                      selectedImage === i ? 'border-ink' : 'border-hairline'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={getOptimizedImageUrl(img.downloadUrl, { w: 120, h: 100 })}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details — 45% */}
          <div>
            <div className="bg-canvas border border-hairline p-6 sm:p-8">
              {/* Brand + Category */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-ink uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-mute">·</span>
                <span className="text-xs text-mute">{product.category.name}</span>
              </div>

              <h1 className="font-mono text-2xl sm:text-3xl font-bold text-ink leading-snug">
                {product.name}
              </h1>

              {/* Reviews count */}
              <p className="text-xs text-mute mt-2">(128 reviews)</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-5">
                <span className="text-3xl font-bold text-ink">
                  ${product.price.toFixed(2)}
                </span>
                {inStock ? (
                  <Badge variant="success">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              {isLowStock && (
                <p className="text-sm text-danger mt-1">Only {product.inventory} left in stock</p>
              )}

              {/* Description */}
              <p className="text-body text-sm leading-relaxed mt-5">{product.description}</p>

              {/* Quantity + Add to Cart */}
              {inStock && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-body">Quantity:</span>
                    <div className="flex items-center border border-hairline rounded-sm overflow-hidden">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="px-3 py-2 text-body hover:bg-surface-soft text-xs"
                        aria-label="Decrease quantity"
                      >
                        [-]
                      </button>
                      <span className="px-4 py-2 text-ink text-sm min-w-[2.5rem] text-center select-none">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty((q) => Math.min(product.inventory, q + 1))}
                        className="px-3 py-2 text-body hover:bg-surface-soft text-xs"
                        aria-label="Increase quantity"
                      >
                        [+]
                      </button>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full text-base"
                    loading={addToCart.isPending}
                    onClick={handleAddToCart}
                  >
                    {addedFeedback ? '✓ Added!' : `Add to Cart — $${(product.price * qty).toFixed(2)}`}
                  </Button>
                </div>
              )}

              {!inStock && (
                <div className="mt-6">
                  <Button variant="outline" size="lg" disabled className="w-full">
                    Out of stock
                  </Button>
                </div>
              )}

              {/* Trust signals */}
              <div className="mt-6 space-y-3 pt-6 border-t border-hairline">
                {trustSignals.map((text) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-body">
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed content */}
        <div className="mt-10">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="bg-canvas border border-hairline p-6 mt-4">
              <p className="text-body text-sm leading-relaxed">{product.description}</p>
              <p className="text-mute text-sm mt-4">
                Weight: 500g | Storage: Store in a cool, dry place
              </p>
            </TabsContent>
            <TabsContent value="nutrition" className="bg-canvas border border-hairline p-6 mt-4">
              <p className="text-body text-sm">Nutritional information coming soon.</p>
            </TabsContent>
            <TabsContent value="reviews" className="bg-canvas border border-hairline p-6 mt-4">
              <p className="text-body text-sm">Customer reviews coming soon.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
