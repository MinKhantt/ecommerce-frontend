import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-canvas text-body border-t border-hairline mt-auto">
      <div className="max-w-7xl mx-auto px-lg py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono font-bold text-sm text-ink">QuickMart</span>
          <nav className="flex gap-6 text-sm">
            <Link to="/products" className="hover:text-ink">
              Products
            </Link>
            <Link to="/cart" className="hover:text-ink">
              Cart
            </Link>
            <Link to="/orders" className="hover:text-ink">
              Orders
            </Link>
          </nav>
          <p className="text-xs text-mute">
            &copy; {new Date().getFullYear()} QuickMart. Fresh groceries delivered.
          </p>
        </div>
      </div>
    </footer>
  );
}
