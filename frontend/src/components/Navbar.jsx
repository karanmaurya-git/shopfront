import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart, clearCartLocally } = useCart();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    clearCartLocally();
    navigate('/');
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-mark">₹</span>
          <span className="brand-name">Shopfront</span>
        </div>
        <div className="topbar-actions">
          <button className="theme-toggle" onClick={toggleTheme} title="Switch theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user ? (
            <>
              <span className="user-badge">
                <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span className="topbar-greeting">Welcome, {user.name}</span>
              </span>
              <button className="btn-accent" onClick={() => navigate('/')}>Shop now</button>
              <button className="btn-outline" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={() => navigate('/login')}>Log in</button>
              <button className="btn-accent" onClick={() => navigate('/register')}>Sign up</button>
            </>
          )}
        </div>
      </header>

      <nav className="tabbar">
        <NavLink to="/" end className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>
          🛍️ Products
        </NavLink>
        {user && (
          <NavLink to="/wishlist" className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>
            🔖 Saved {wishlist.length > 0 && <span className="tab-count">{wishlist.length}</span>}
          </NavLink>
        )}
        {user && (
          <NavLink to="/cart" className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>
            🛒 Cart {itemCount > 0 && <span className="tab-count">{itemCount}</span>}
          </NavLink>
        )}
        {user && (
          <NavLink to="/orders" className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>
            📦 My Orders
          </NavLink>
        )}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>
            📊 Admin
          </NavLink>
        )}
      </nav>
    </>
  );
};

export default Navbar;
