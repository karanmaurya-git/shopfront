import { formatINR } from '../utils/currency';
import { useCategories } from '../context/CategoryContext';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { getIcon } = useCategories();
  const product = item.product;
  if (!product) return null;

  return (
    <div className="cart-item">
      <div className="cart-item-left">
        <div className="icon-avatar" style={{ background: 'var(--surface)' }}>{getIcon(product.category)}</div>
        <div className="cart-item-info">
          <h4>{product.name}</h4>
          <p>{formatINR(product.price)} each</p>
        </div>
      </div>
      <div className="cart-item-controls">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(product._id, Number(e.target.value))}
        />
        <p className="cart-item-subtotal">{formatINR(product.price * item.quantity)}</p>
        <button onClick={() => onRemove(product._id)} className="btn-remove">Remove</button>
      </div>
    </div>
  );
};

export default CartItem;
