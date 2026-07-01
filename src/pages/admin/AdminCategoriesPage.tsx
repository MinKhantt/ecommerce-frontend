import { useState, useMemo } from 'react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../api/hooks';
import { Button, Input, ErrorMessage, PageLoader } from '../../components/ui';
import type { Category } from '../../types';

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const openCreate = () => {
    setEditId(null);
    setName('');
    setError('');
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditId(c.id);
    setName(c.name);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await updateCategory.mutateAsync({ id: editId, data: { name } });
      } else {
        await createCategory.mutateAsync(name);
      }
      setShowForm(false);
      setEditId(null);
      setName('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Operation failed.';
      setError(msg);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Delete category "${label}"?`)) return;
    await deleteCategory.mutateAsync(id);
  };

  const filtered = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return (categories as Category[]).filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const isPending = createCategory.isPending || updateCategory.isPending;

  if (isLoading) return <PageLoader />;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Categories</h1>
          <p className="text-sm text-mute mt-0.5">{categories.length} categories</p>
        </div>
        <Button variant="default" onClick={openCreate}>
          + Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2.5 rounded-sm border border-hairline bg-canvas text-sm text-ink focus:outline-none flex-1 min-w-[200px]"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-surface-dark/50 z-50 flex items-center justify-center p-4">
          <div className="bg-canvas rounded-sm w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="px-6 py-5 border-b border-hairline flex items-center justify-between">
              <h2 className="font-bold text-ink">
                {editId ? 'Edit Category' : 'Add Category'}
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
                label="Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  variant="default"
                  loading={isPending}
                  className="flex-1"
                >
                  {editId ? 'Save changes' : 'Create category'}
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
                <th className="text-left px-5 py-3.5 font-semibold text-body text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-4 font-medium text-body">{category.name}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(category)}
                        className="text-xs px-2.5 py-1.5 rounded-sm border border-hairline text-body"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={deleteCategory.isPending}
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
                  <td colSpan={2} className="text-center py-12 text-stone">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
