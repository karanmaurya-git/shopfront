import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import OrderTracker from '../components/OrderTracker';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    const { data } = await api.get('/orders/myorders');
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      showToast('Order cancelled', 'success');
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not cancel order', 'error');
    }
  };

  if (loading) return <p className="loading">Loading orders...</p>;
  if (orders.length === 0) return <div className="page"><h1>My Orders</h1><p>No orders yet.</p></div>;

  return (
    <div className="page">
      <h1>My Orders</h1>
      <div className="order-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <span className="mono">#{order._id.slice(-6).toUpperCase()}</span>
              <span className={`order-status status-${order.status}`}>{order.status}</span>
            </div>
            <p className="order-date">Placed {formatDate(order.createdAt)}</p>
            <OrderTracker status={order.status} />

            {order.status === 'delivered' && order.deliveredAt && (
              <p className="delivery-line delivered">✅ Delivered on {formatDate(order.deliveredAt)}</p>
            )}
            {order.status !== 'delivered' && order.status !== 'cancelled' && order.estimatedDelivery && (
              <p className="delivery-line">📦 Estimated delivery: {formatDate(order.estimatedDelivery)}</p>
            )}

            <ul>
              {order.items.map((item, idx) => (
                <li key={idx}>
                  <span>{item.name} × {item.quantity}</span>
                  <span className="mono">{formatINR(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="order-card-footer">
              <p className="order-total mono">Total: {formatINR(order.totalAmount)}</p>
              {order.status === 'pending' && (
                <button className="btn-remove" onClick={() => handleCancel(order._id)}>Cancel order</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
