const CLOUDINARY_DOMAIN = 'res.cloudinary.com';

export const PLACEHOLDER_IMG = 'https://placehold.co/400x320/f1f5f9/94a3b8?text=No+Image';

export function getOptimizedImageUrl(
  url: string | undefined | null,
  options?: { w?: number; h?: number; crop?: string },
): string {
  if (!url) return PLACEHOLDER_IMG;
  if (!url.includes(CLOUDINARY_DOMAIN)) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transforms = ['q_auto', 'f_auto'];
  if (options?.w) transforms.push(`w_${options.w}`);
  if (options?.h) transforms.push(`h_${options.h}`);
  transforms.push(`c_${options?.crop || 'fill'}`);

  return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
}
