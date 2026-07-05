import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { formatINR } from '../utils/currency';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const items = cart.items || [];
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Your Cart</h1>
        <div className="empty-state">
          <p>Your cart is empty</p>
          <span><Link to="/">Browse products</Link> to add something</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your Cart</h1>
      <div className="card-block cart-list">
        {items.map((item) => (
          <CartItem
            key={item.product._id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
          />
        ))}
      </div>
      <div className="cart-summary">
        <h3>Total: <span className="mono">{formatINR(total)}</span></h3>
        <button className="btn-accent" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
      </div>
    </div>
  );
};

export default Cart;
