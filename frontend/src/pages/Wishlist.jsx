import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="page">
        <h1>My Wishlist</h1>
        <div className="empty-state">
          <p>Your wishlist is empty</p>
          <span><Link to="/">Browse products</Link> and tap 🔖 Save to keep track of items you like</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My Wishlist</h1>
      <div className="product-grid">
        {wishlist.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
