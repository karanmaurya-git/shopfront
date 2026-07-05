import { Link, useNavigate } from 'react-router-dom';
import { formatINR } from '../utils/currency';
import { getSaleInfo } from '../utils/sale';
import { getProductImages } from '../utils/productImages';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCategories } from '../context/CategoryContext';
import { useToast } from '../context/ToastContext';
import StarRating from './StarRating';
import CountdownTimer from './CountdownTimer';

const ProductCard = ({ product }) => {
  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;
  const { getIcon } = useCategories();
  const { onSale, effectivePrice, saleEndsAt } = getSaleInfo(product);
  const images = getProductImages(product);
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    const added = await toggleWishlist(product._id);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist', 'success');
  };

  return (
    <div className={`product-card ${outOfStock ? 'product-card-disabled' : ''}`}>
      <Link to={`/products/${product._id}`}>
        <div className="product-card-image">
          {images.length > 0 ? (
            <img src={images[0]} alt={product.name} />
          ) : (
            <div className="icon-avatar icon-avatar-lg" style={{ background: 'var(--surface)' }}>{getIcon(product.category)}</div>
          )}
          {outOfStock && <span className="ribbon">Sold out</span>}
          {lowStock && !outOfStock && <span className="badge-low">Only {product.stock} left</span>}
          {onSale && <span className="badge-sale">SALE</span>}
          {user && (
            <button className={`save-btn ${isWishlisted(product._id) ? 'save-btn-active' : ''}`} onClick={handleWishlistClick}>
              {isWishlisted(product._id) ? '🔖 Saved' : '🔖 Save'}
            </button>
          )}
        </div>
        <p className="product-card-category">{product.category}</p>
        <h3>{product.name}</h3>
        {product.numReviews > 0 && <StarRating rating={product.averageRating} count={product.numReviews} size="sm" />}
        <div className="price-row">
          {onSale ? (
            <>
              <span className="price-tag price-tag-sale">{formatINR(effectivePrice)}</span>
              <span className="price-original">{formatINR(product.price)}</span>
            </>
          ) : (
            <span className="price-tag">{formatINR(product.price)}</span>
          )}
        </div>
        {onSale && <CountdownTimer endTime={saleEndsAt} />}
      </Link>
    </div>
  );
};

export default ProductCard;
