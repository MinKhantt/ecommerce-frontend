import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { useCart, useLogout } from '../../api/hooks';
import { useUIStore } from '../../stores/ui-store';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const { data: cart } = useCart();
  const { toggleMobileNav } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const cartCount = cart?.cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {}
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-canvas border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 font-mono font-bold text-ink no-underline">
            GreenCart
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full px-3 py-1.5 rounded-sm border border-hairline bg-surface-soft text-sm text-ink placeholder-ash focus:outline-none focus:border-ink focus:bg-canvas"
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ash hover:text-ink"
                  aria-label="Clear search"
                >
                  [x]
                </button>
              )}
            </div>
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-canvas border border-hairline p-3">
                <p className="text-sm text-body text-center py-3">
                  Press Enter to search for &ldquo;{searchQuery}&rdquo;
                </p>
                <Link
                  to={`/products?search=${encodeURIComponent(searchQuery)}`}
                  className="block text-center text-sm text-ink underline"
                >
                  View all results →
                </Link>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative px-2 py-1 text-sm text-body hover:text-ink rounded-sm"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-sm text-sm ${isActive ? 'bg-surface-soft text-ink' : 'text-body hover:text-ink'}`
                }
              >
                Products
              </NavLink>

              {isAuthenticated ? (
                <div className="flex items-center gap-1">
                  <div className="relative group">
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-sm text-body hover:text-ink">
                      Account
                    </button>
                    <div className="absolute right-0 mt-1 w-48 bg-canvas border border-hairline opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none group-hover:pointer-events-auto z-50">
                      <div className="py-1">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-body hover:text-ink hover:bg-surface-soft">
                          Profile
                        </Link>
                        <Link to="/orders" className="block px-4 py-2 text-sm text-body hover:text-ink hover:bg-surface-soft">
                          My Orders
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="block px-4 py-2 text-sm text-body hover:text-ink hover:bg-surface-soft">
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-1 border-hairline" />
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-danger hover:text-danger-hover hover:bg-surface-soft">
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link to="/login" className="px-3 py-1.5 rounded-sm text-sm text-body hover:text-ink">
                    Sign in
                  </Link>
                  <Link to="/register" className="px-4 py-1.5 rounded-sm text-sm text-on-primary bg-primary hover:bg-ink-deep">
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile buttons */}
            <button
              onClick={toggleMobileNav}
              className="md:hidden px-2 py-1 text-sm text-body hover:text-ink rounded-sm"
              aria-label="Open menu"
            >
              [menu]
            </button>
          </div>
        </div>
      </header>
      {/* Spacer */}
      <div className="h-8" />
    </>
  );
}
