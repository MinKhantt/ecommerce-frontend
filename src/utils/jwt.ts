export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isAdminToken(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded) return false;

  // Spring Security can put authorities as array of strings or objects
  const authorities = (decoded.authorities ?? decoded.roles ?? decoded.role ?? []) as unknown[];

  if (Array.isArray(authorities)) {
    return authorities.some((a) => {
      if (typeof a === 'string') return a === 'ROLE_ADMIN';
      if (typeof a === 'object' && a !== null) {
        return (a as Record<string, string>).authority === 'ROLE_ADMIN';
      }
      return false;
    });
  }

  return false;
}
