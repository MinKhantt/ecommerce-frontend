import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../api/hooks';
import { cn } from '../../lib/utils';

export default function MobileNav() {
  const location = useLocation();
  const { data: cart } = useCart();
  const isAdmin = location.pathname.startsWith('/admin');

  const cartCount = cart?.cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  if (isAdmin) return null;

  const links = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/cart', label: `Cart${cartCount > 0 ? ` (${cartCount})` : ''}` },
    { to: '/profile', label: 'Account' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-canvas border-t border-hairline" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-12">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full text-xs',
              location.pathname === to
                ? 'text-ink'
                : 'text-mute'
            )}
            aria-label={label}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
