import { useState, useMemo } from 'react';
import {
  useProducts,
  useCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUploadImages,
} from '../../api/hooks';
import { Button, Input, Select, ErrorMessage, PageLoader } from '../../components/ui';
import { getOptimizedImageUrl } from '../../utils/images';
import type { Product, AddProductRequest } from '../../types';

const emptyForm: AddProductRequest = {
  name: '',
  brand: '',
  price: 0,
  inventory: 0,
  description: '',
  category: '',
};

type SortKey = 'name' | 'brand' | 'price' | 'inventory';
type SortDir = 'asc' | 'desc';

export default function AdminProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AddProductRequest>(emptyForm);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const uploadImages = useUploadImages();

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === 'price' || name === 'inventory' ? Number(value) : value,
    }));
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setShowNewCategory(false);
    setFiles([]);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      price: p.price,
      inventory: p.inventory,
      description: p.description,
      category: p.category.name,
    });
    setError('');
    setShowNewCategory(!categories.some((c) => c.name === p.category.name));
    setFiles([]);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let productId: string | undefined;
      if (editId) {
        await updateProduct.mutateAsync({ id: editId, data: form });
        productId = editId;
      } else {
        const created = await createProduct.mutateAsync(form);
        productId = created.id;
      }
      if (files.length > 0 && productId) {
        await uploadImages.mutateAsync({ files, productId });
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      setShowNewCategory(false);
      setFiles([]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Operation failed.';
      setError(msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteProduct.mutateAsync(id);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected products?`)) return;
    for (const id of selected) {
      await deleteProduct.mutateAsync(id);
    }
    setSelected(new Set());
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const exportCsv = () => {
    const headers = ['Name', 'Brand', 'Category', 'Price', 'Inventory', 'Description'];
    const rows = filtered.map((p) =>
      [
        p.name,
        p.brand,
        p.category.name,
        p.price,
        p.inventory,
        `"${p.description.replace(/"/g, '""')}"`,
      ].join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => {
    let list = (products as Product[]).filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()),
    );
    list.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return list;
  }, [products, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const toggleAll = () => {
    if (selected.size === paged.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paged.map((p) => p.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) return <PageLoader />;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Products</h1>
          <p className="text-sm text-mute mt-0.5">{products.length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={exportCsv}>
            Export CSV
          </Button>
          <Button variant="default" onClick={openCreate}>
            + Add Product
          </Button>
        </div>
      </div>

      {/* Search + Bulk actions */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2.5 rounded-sm border border-hairline bg-canvas text-sm text-ink focus:outline-none flex-1 min-w-[200px]"
        />
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} loading={deleteProduct.isPending}>
            Delete ({selected.size})
          </Button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-surface-dark/50 z-50 flex items-center justify-center p-4">
          <div className="bg-canvas rounded-sm w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="px-6 py-5 border-b border-hairline flex items-center justify-between">
              <h2 className="font-bold text-ink">
                {editId ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-stone"
              >
                &#10005;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
              {error && <ErrorMessage message={error} />}
              <Input
                id="name"
                name="name"
                label="Name"
                value={form.name}
                onChange={handleField}
                required
              />
              <Input
                id="brand"
                name="brand"
                label="Brand"
                value={form.brand}
                onChange={handleField}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="price"
                  name="price"
                  type="number"
                  label="Price ($)"
                  value={form.price}
                  onChange={handleField}
                  min={0}
                  step={0.01}
                  required
                />
                <Input
                  id="inventory"
                  name="inventory"
                  type="number"
                  label="Inventory"
                  value={form.inventory}
                  onChange={handleField}
                  min={0}
                  required
                />
              </div>
              {!showNewCategory ? (
                <div className="flex gap-2 items-end">
                  <Select
                    id="category"
                    name="category"
                    label="Category"
                    value={form.category}
                    onChange={handleField}
                    required
                    className="flex-1"
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNewCategory(true);
                      setForm((f) => ({ ...f, category: '' }));
                    }}
                    className="whitespace-nowrap"
                  >
                    + New
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 items-end">
                  <Input
                    id="category"
                    name="category"
                    label="New Category"
                    value={form.category}
                    onChange={handleField}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowNewCategory(false)}
                    className="whitespace-nowrap"
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label htmlFor="description" className="text-sm font-medium text-body">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleField}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-sm border border-hairline text-sm text-ink placeholder-stone focus:outline-none resize-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="images" className="text-sm font-medium text-body">
                  Images
                </label>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    setFiles((prev) => [...prev, ...newFiles]);
                    e.target.value = '';
                  }}
                  className="text-sm text-mute file:mr-3 file:px-3 file:py-1.5 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-surface-soft file:text-primary"
                />
                {files.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1">
                    {files.map((file, i) => (
                      <div key={`${file.name}-${i}`} className="flex items-center justify-between text-xs text-ash">
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                          className="text-danger ml-2"
                        >
                          [x]
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  variant="default"
                  loading={createProduct.isPending || updateProduct.isPending}
                  className="flex-1"
                >
                  {editId ? 'Save changes' : 'Create product'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-canvas rounded-sm border border-hairline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="px-5 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === paged.length && paged.length > 0}
                    onChange={toggleAll}
                    className="rounded-sm border-hairline text-primary focus:outline-none"
                  />
                </th>
                <th
                  className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  Product {sortKey === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort('brand')}
                >
                  Brand {sortKey === 'brand' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Category
                </th>
                <th
                  className="text-right px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort('price')}
                >
                  Price {sortKey === 'price' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="text-right px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => handleSort('inventory')}
                >
                  Stock {sortKey === 'inventory' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {paged.map((product) => (
                <tr
                  key={product.id}
                  className={`${selected.has(product.id) ? 'bg-surface-soft' : ''} ${product.inventory === 0 ? 'opacity-60' : ''}`}
                >
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleOne(product.id)}
                      className="rounded-sm border-hairline text-primary focus:outline-none"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={getOptimizedImageUrl(product.images[0].downloadUrl, { w: 72, h: 72 })}
                          alt=""
                          loading="lazy"
                          className="w-9 h-9 rounded-sm object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-sm bg-surface-card flex-shrink-0" />
                      )}
                      <span className="font-medium text-body line-clamp-1">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-mute">{product.brand}</td>
                  <td className="px-5 py-4 text-mute">{product.category.name}</td>
                  <td className="px-5 py-4 text-right font-medium text-body">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={`font-medium ${product.inventory === 0 ? 'text-danger' : 'text-body'}`}
                    >
                      {product.inventory}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="text-xs px-2.5 py-1.5 rounded-sm border border-hairline text-body"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleteProduct.isPending}
                        className="text-xs px-2.5 py-1.5 rounded-sm border border-hairline text-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-mute">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-2 py-1.5 text-sm rounded-sm border border-hairline bg-canvas text-body focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-mute">
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of{' '}
              {filtered.length}
            </span>
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-2.5 py-1.5 text-sm rounded-sm border border-hairline text-body"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-2.5 py-1.5 text-sm rounded-sm border border-hairline text-body"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
