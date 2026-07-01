import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '../../api/hooks';
import ProductCard from '../../components/ui/ProductCard';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

export default function HomePage() {
  const { data: products, isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const featured = (products ?? []).slice(0, 8);

  return (
    <div className="min-h-screen text-left">
      {/* Hero */}
      <section className="bg-surface-dark text-on-dark text-left">
        <div className="max-w-7xl mx-auto px-lg pt-10 pb-20 lg:pt-10 lg:pb-28 relative">
          <div className="max-w-2xl relative z-10">
            <p className="text-on-dark-mute text-sm font-semibold uppercase tracking-widest mb-4">
              Fresh groceries, delivered
            </p>
            <h1 className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              Shop smarter,
              <br />
              <span className="text-on-dark-mute">eat better.</span>
            </h1>
            <p className="text-on-dark-mute text-lg mt-5 leading-relaxed max-w-lg">
              Discover a curated range of fresh produce, pantry staples, and everyday essentials.
              Free shipping on orders over $50.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <Link to="/products">
                <Button size="lg" className="bg-on-dark text-ink">
                  Shop now
                </Button>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center text-on-dark-mute font-medium px-4 py-3 text-sm"
              >
                Create account
                →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-canvas border-b border-hairline">
        <div className="max-w-7xl mx-auto px-lg">
          <div className="grid grid-cols-3 divide-x divide-hairline">
            {[
              { value: `${products?.length ?? 0}+`, label: 'Products' },
              { value: `${categories.length}+`, label: 'Categories' },
              { value: 'Free', label: 'Shipping' },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-5">
                <p className="text-xl font-bold text-ink">{stat.value}</p>
                <p className="text-xs text-ash mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-lg py-12">
          <h2 className="font-mono text-xl font-semibold text-ink mb-6">Browse by category</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="flex-shrink-0 px-4 py-2 rounded-full border border-hairline bg-canvas text-sm font-medium text-ash whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-lg pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-mono text-xl font-semibold text-ink">Featured products</h2>
          <Link to="/products" className="text-sm text-primary font-medium inline-flex items-center gap-1">
            View all
            →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-sm overflow-hidden border border-hairline">
                <Skeleton className="aspect-[4/5]" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
