import { NavLink, Outlet, Link } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/images', label: 'Images' },
  { to: '/admin/categories', label: 'Categories' },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-56 bg-ink flex flex-col z-50">
        <Link to="/admin" className="flex items-center gap-2 px-5 h-14 border-b border-hairline shrink-0 font-mono font-bold text-sm text-on-dark no-underline">
          GreenCart
        </Link>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-sm text-sm ${isActive ? 'bg-surface-dark-elevated text-on-dark' : 'text-on-dark-mute hover:text-on-dark hover:bg-surface-dark-elevated'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 py-3 border-t border-hairline shrink-0">
          <Link
            to="/"
            className="block px-3 py-2 rounded-sm text-sm text-on-dark-mute hover:text-on-dark hover:bg-surface-dark-elevated"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        <header className="h-14 bg-canvas border-b border-hairline flex items-center justify-between px-5 sticky top-0 z-40">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-1.5 rounded-sm border border-hairline bg-surface-soft text-sm text-ink placeholder-ash focus:outline-none focus:border-ink focus:bg-canvas"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-body">
            <span>[notifications]</span>
            <span className="px-2 py-1 rounded-sm bg-primary text-on-primary text-xs">A</span>
          </div>
        </header>

        <main className="flex-1 p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
