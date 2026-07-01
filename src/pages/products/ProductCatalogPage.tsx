import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '../../api/hooks';
import ProductCard from '../../components/ui/ProductCard';
import { Button } from '../../components/ui/button';
import { PageLoader, EmptyState } from '../../components/ui/deprecated';
import type { Product } from '../../types';

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Name A–Z' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

const VISIBLE_INCREMENT = 12;

export default function ProductCatalogPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [visibleCount, setVisibleCount] = useState(VISIBLE_INCREMENT);
  const [showFilters, setShowFilters] = useState(false);

  const brands = useMemo(() => {
    const set = new Set(products.map((p: Product) => p.brand));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products] as Product[];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category.id === selectedCategory);
    }
    if (selectedBrand) {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': return b.id.localeCompare(a.id);
        default: return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [products, search, selectedCategory, selectedBrand, sortBy]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const hasFilters = search || selectedCategory || selectedBrand;

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSortBy('name');
    setVisibleCount(VISIBLE_INCREMENT);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      {/* <div className="bg-canvas border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-ink">All Products</h1>
          <p className="text-body text-sm mt-1">{products.length} items available</p>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar — desktop filters */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Category list */}
              <div>
                <h3 className="text-xs text-mute uppercase tracking-wider mb-3">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block w-full text-left px-3 py-2 rounded-sm text-sm ${
                      !selectedCategory ? 'bg-surface-soft text-ink' : 'text-body hover:text-ink hover:bg-surface-soft'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`block w-full text-left px-3 py-2 rounded-sm text-sm ${
                        selectedCategory === cat.id ? 'bg-surface-soft text-ink' : 'text-body hover:text-ink hover:bg-surface-soft'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand filter */}
              {brands.length > 0 && (
                <div>
                  <h3 className="text-xs text-mute uppercase tracking-wider mb-3">Brands</h3>
                  <div className="space-y-1">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                        className={`block w-full text-left px-3 py-2 rounded-sm text-sm ${
                          selectedBrand === brand ? 'bg-surface-soft text-ink' : 'text-body hover:text-ink hover:bg-surface-soft'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-ink underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search + sort bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setVisibleCount(VISIBLE_INCREMENT); }}
                  className="w-full px-3 py-2 rounded-sm border border-hairline bg-surface-soft text-sm text-ink placeholder-ash focus:outline-none focus:border-ink focus:bg-canvas"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-mute hover:text-ink text-xs"
                  >
                    [x]
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 rounded-sm border border-hairline bg-canvas text-sm text-ink focus:outline-none focus:border-ink cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-sm border border-hairline text-sm text-body hover:text-ink hover:bg-surface-soft"
              >
                Filters
              </button>
            </div>

            {/* Mobile filters panel */}
            {showFilters && (
              <div className="lg:hidden bg-canvas border border-hairline p-4 mb-6 space-y-4">
                <div>
                  <h3 className="text-xs text-mute uppercase mb-2">Category</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-3 py-1.5 rounded-sm text-xs ${
                        !selectedCategory ? 'bg-ink text-on-dark' : 'bg-surface-card text-body hover:bg-surface-card'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-sm text-xs ${
                          selectedCategory === cat.id ? 'bg-ink text-on-dark' : 'bg-surface-card text-body hover:bg-surface-card'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {brands.length > 0 && (
                  <div>
                    <h3 className="text-xs text-mute uppercase mb-2">Brand</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {brands.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                          className={`px-3 py-1.5 rounded-sm text-xs ${
                            selectedBrand === brand ? 'bg-ink text-on-dark' : 'bg-surface-card text-body hover:bg-surface-card'
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {hasFilters && (
                  <button onClick={clearFilters} className="text-sm text-ink underline">
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Results */}
            {isLoading ? (
              <PageLoader />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try adjusting your filters or search term."
                action={
                  hasFilters ? (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <p className="text-sm text-body mb-4">
                  Showing {visibleProducts.length} of {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setVisibleCount((prev) => prev + VISIBLE_INCREMENT)}
                    >
                      Load more ({filtered.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
