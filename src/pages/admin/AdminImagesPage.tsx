import { useState, useRef } from 'react';
import { useProducts, useUploadImages, useUpdateImage, useDeleteImage } from '../../api/hooks';
import { Button, ErrorMessage, PageLoader, EmptyState } from '../../components/ui';
import { getOptimizedImageUrl } from '../../utils/images';

export default function AdminImagesPage() {
  const { data: products = [], isLoading } = useProducts();
  const uploadImages = useUploadImages();
  const updateImage = useUpdateImage();
  const deleteImage = useDeleteImage();

  const [selectedId, setSelectedId] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const product = products.find((p) => p.id === selectedId);

  const handleUpload = async () => {
    if (!selectedId || files.length === 0) return;
    setError('');
    try {
      await uploadImages.mutateAsync({ files, productId: selectedId });
      setFiles([]);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Upload failed.';
      setError(msg);
    }
  };

  const handleReplace = async (imageId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setError('');
      try {
        await updateImage.mutateAsync({ imageId, file });
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Update failed.';
        setError(msg);
      }
    };
    input.click();
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;
    setError('');
    try {
      await deleteImage.mutateAsync(imageId);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Delete failed.';
      setError(msg);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Product Images</h1>
          <p className="text-sm text-mute mt-0.5">
            {selectedId && product ? `${product.images.length} images` : `${products.length} products`}
          </p>
        </div>
      </div>

        {/* Product selector */}
        <div className="mb-6">
          <label className="text-sm font-medium text-body block mb-1.5">Product</label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setError('');
              setFiles([]);
              if (fileRef.current) fileRef.current.value = '';
            }}
            className="w-full max-w-md px-3.5 py-2.5 rounded-sm border border-hairline bg-canvas text-sm text-ink focus:outline-none"
          >
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.brand}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

        {/* Image grid or no-product state */}
        {selectedId && product ? (
          <>
            {product.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {product.images.map((img) => (
                  <div key={img.id} className="bg-canvas rounded-sm border border-hairline overflow-hidden">
                    <div className="aspect-square bg-surface-soft relative">
                      <img
                        src={getOptimizedImageUrl(img.downloadUrl, { w: 400, h: 400 })}
                        alt={img.fileName}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/400x400/f1eeee/9a9898?text=Error';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-mute truncate mb-2">{img.fileName}</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleReplace(img.id)}
                          disabled={updateImage.isPending}
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-sm border border-hairline text-body"
                        >
                          Replace
                        </button>
                        <button
                          onClick={() => handleDelete(img.id)}
                          disabled={deleteImage.isPending}
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-sm border border-hairline text-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-8">
                <EmptyState
                  title="No images yet"
                  description="Upload images for this product to get started."
                />
              </div>
            )}

            {/* Upload section */}
            <div className="bg-canvas rounded-sm border border-hairline p-6">
              <h3 className="font-semibold text-ink mb-3">Upload New Images</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="block w-full text-sm text-mute file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-surface-soft file:text-primary"
                />
                <Button
                  variant="default"
                  onClick={handleUpload}
                  disabled={!selectedId || files.length === 0}
                  loading={uploadImages.isPending}
                  className="shrink-0"
                >
                  Upload{files.length > 0 ? ` (${files.length})` : ''}
                </Button>
              </div>
              {files.length > 0 && (
                <p className="text-xs text-stone mt-2">{files.map((f) => f.name).join(', ')}</p>
              )}
            </div>
          </>
        ) : (
          !isLoading && (
            <EmptyState
              title="Select a product"
              description="Choose a product from the dropdown above to manage its images."
            />
          )
        )}
    </div>
  );
}
