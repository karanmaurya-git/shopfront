import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const { showToast } = useToast();
  const [form, setForm] = useState({ address: '', city: '', postalCode: '', country: 'India' });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const items = cart.items || [];
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      await api.post('/orders', { shippingAddress: form });
      await fetchCart();
      showToast('Order placed — pay on delivery', 'success');
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return <div className="page"><p>Your cart is empty.</p></div>;
  }

  return (
    <div className="page checkout-layout">
      <form onSubmit={handlePlaceOrder} className="form-page checkout-form">
        <h1>Checkout</h1>
        <p className="payment-note">Payment method: <strong>Cash on Delivery</strong></p>
        {error && <p className="form-error">{error}</p>}
        <label>Address</label>
        <input name="address" value={form.address} onChange={handleChange} required />
        <label>City</label>
        <input name="city" value={form.city} onChange={handleChange} required />
        <label>Postal Code (PIN)</label>
        <input name="postalCode" value={form.postalCode} onChange={handleChange} required />
        <label>Country</label>
        <input name="country" value={form.country} onChange={handleChange} required />
        <button type="submit" disabled={placing}>{placing ? 'Placing order...' : 'Place Order'}</button>
      </form>

      <div className="order-summary-card">
        <h3>Order Summary</h3>
        {items.map((item) => (
          <div key={item.product._id} className="summary-row">
            <span>{item.product.name} × {item.quantity}</span>
            <span className="mono">{formatINR(item.product.price * item.quantity)}</span>
          </div>
        ))}
        <div className="summary-row summary-total">
          <span>Total</span>
          <span className="mono">{formatINR(total)}</span>
        </div>
        <p className="delivery-hint">📦 Estimated delivery: 5 business days after ordering</p>
      </div>
    </div>
  );
};

export default Checkout;
