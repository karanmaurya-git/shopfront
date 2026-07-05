import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { useCategories } from '../context/CategoryContext';
import { getSaleInfo } from '../utils/sale';
import { getProductImages } from '../utils/productImages';
import StarRating from '../components/StarRating';
import StarRatingInput from '../components/StarRatingInput';
import CountdownTimer from '../components/CountdownTimer';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { getIcon } = useCategories();
  const navigate = useNavigate();

  const fetchProduct = () => api.get(`/products/${id}`).then(({ data }) => {
    setProduct(data);
    setActiveImage(0);
    api.get('/products', { params: { category: data.category } }).then(({ data: sameCategory }) => {
      setRelated(sameCategory.filter((p) => p._id !== data._id).slice(0, 4));
    });
  });
  const fetchReviews = () => api.get(`/products/${id}/reviews`).then(({ data }) => setReviews(data));

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    try {
      await addToCart(product._id, quantity);
      showToast(`Added ${quantity} × ${product.name} to your cart`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add to cart', 'error');
    }
  };

  const handleWishlist = async () => {
    if (!user) return navigate('/login');
    const added = await toggleWishlist(product._id);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist', 'success');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!reviewForm.rating) {
      setReviewError('Please select a star rating');
      return;
    }
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      setReviewForm({ rating: 0, comment: '' });
      showToast('Review posted', 'success');
      fetchReviews();
      fetchProduct();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not post review');
    }
  };

  if (!product) return <p className="loading">Loading...</p>;
  const { onSale, effectivePrice, saleEndsAt } = getSaleInfo(product);
  const alreadyReviewed = user && reviews.some((r) => r.user === user._id);
  const images = getProductImages(product);

  return (
    <div className="page product-detail">
      <Link to="/" className="back-link">&larr; Back to products</Link>
      <div className="product-detail-body">
        <div className="product-gallery">
          <div className="product-detail-image">
            {images.length > 0 ? (
              <img src={images[activeImage]} alt={product.name} />
            ) : (
              <div className="icon-avatar icon-avatar-xl" style={{ background: 'var(--surface)' }}>{getIcon(product.category)}</div>
            )}
            {product.stock === 0 && <span className="ribbon">Sold out</span>}
          </div>
          {images.length > 1 && (
            <div className="thumbnail-row">
              {images.map((url, idx) => (
                <button
                  key={idx}
                  className={`thumbnail-btn ${idx === activeImage ? 'thumbnail-btn-active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={url} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="product-detail-info">
          <div className="product-detail-top">
            <p className="product-card-category">{product.category}</p>
            {user && (
              <button className={`save-btn-inline ${isWishlisted(product._id) ? 'save-btn-active' : ''}`} onClick={handleWishlist}>
                {isWishlisted(product._id) ? '🔖 Saved' : '🔖 Save for later'}
              </button>
            )}
          </div>
          <h1>{product.name}</h1>
          {product.numReviews > 0 && <StarRating rating={product.averageRating} count={product.numReviews} />}

          {onSale ? (
            <div className="price-row">
              <span className="price-tag price-tag-lg price-tag-sale">{formatINR(effectivePrice)}</span>
              <span className="price-original price-original-lg">{formatINR(product.price)}</span>
            </div>
          ) : (
            <div className="price-tag price-tag-lg">{formatINR(product.price)}</div>
          )}
          {onSale && <p><CountdownTimer endTime={saleEndsAt} /> left on this deal</p>}

          <p className="product-detail-desc">{product.description}</p>
          <p className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable'}
          </p>

          {product.stock > 0 && (
            <div className="add-to-cart-row">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <button onClick={handleAddToCart}>Add to Cart</button>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="related-section">
          <h2>You might also like</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      <div className="reviews-section">
        <h2>Reviews {product.numReviews > 0 && `(${product.numReviews})`}</h2>

        {user && !alreadyReviewed && (
          <form onSubmit={handleReviewSubmit} className="review-form card-block">
            <label>Your rating</label>
            <StarRatingInput value={reviewForm.rating} onChange={(rating) => setReviewForm({ ...reviewForm, rating })} />
            <textarea
              placeholder="Share your thoughts on this product..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              required
            />
            {reviewError && <p className="form-error">{reviewError}</p>}
            <button type="submit" className="btn-accent">Post Review</button>
          </form>
        )}
        {!user && <p className="dim">Log in to leave a review.</p>}
        {alreadyReviewed && <p className="dim">You've already reviewed this product.</p>}

        {reviews.length === 0 ? (
          <p className="dim">No reviews yet — be the first!</p>
        ) : (
          <div className="card-block">
            {reviews.map((r) => (
              <div key={r._id} className="review-row">
                <div className="review-row-header">
                  <strong>{r.name}</strong>
                  <StarRating rating={r.rating} size="sm" />
                </div>
                <p>{r.comment}</p>
                <span className="dim">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
