import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';

const STATUS_OPTIONS = ['pending', 'shipped', 'delivered', 'cancelled'];

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    const { data } = await api.get('/orders');
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/orders/${id}`, { status });
      showToast('Order status updated', 'success');
      fetchOrders();
      setSelectedOrder((prev) => (prev && prev._id === id ? { ...prev, status } : prev));
    } catch (err) {
      showToast('Could not update order', 'error');
    }
  };

  if (orders.length === 0) {
    return (
      <div className="page">
        <h1>Manage Orders</h1>
        <div className="empty-state">
          <p>No orders placed yet.</p>
          <span>Orders will show up here once customers check out.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Manage Orders</h1>
      <p className="dim" style={{ marginBottom: 14 }}>Click any order to see full customer and shipping details.</p>
      <div className="card-block">
        {orders.map((order) => (
          <div key={order._id} className="list-row list-row-clickable" onClick={() => setSelectedOrder(order)}>
            <div className="list-row-left">
              <div className="icon-avatar" style={{ background: '#dbeafe' }}>📦</div>
              <div>
                <h4 className="mono">#{order._id.slice(-6).toUpperCase()}</h4>
                <p className="dim">{order.user?.name} ({order.user?.email})</p>
              </div>
            </div>
            <div className="list-row-right">
              <span className="mono price-tag">{formatINR(order.totalAmount)}</span>
              <select
                value={order.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="mono">#{selectedOrder._id.slice(-6).toUpperCase()}</h3>
              <span className={`order-status status-${selectedOrder.status}`}>{selectedOrder.status}</span>
            </div>

            <div className="detail-section">
              <h4>Customer</h4>
              <p>{selectedOrder.user?.name}</p>
              <p className="dim">{selectedOrder.user?.email}</p>
            </div>

            <div className="detail-section">
              <h4>Shipping Address</h4>
              <p>{selectedOrder.shippingAddress?.address}</p>
              <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
              <p>{selectedOrder.shippingAddress?.country}</p>
            </div>

            <div className="detail-section">
              <h4>Items</h4>
              <ul className="detail-items">
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx}>
                    <span>{item.name} × {item.quantity}</span>
                    <span className="mono">{formatINR(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="detail-total">
                <span>Total</span>
                <span className="mono">{formatINR(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Dates</h4>
              <p>Placed: {formatDate(selectedOrder.createdAt)}</p>
              {selectedOrder.estimatedDelivery && <p>Estimated delivery: {formatDate(selectedOrder.estimatedDelivery)}</p>}
              {selectedOrder.deliveredAt && <p>Delivered: {formatDate(selectedOrder.deliveredAt)}</p>}
            </div>

            <div className="detail-section">
              <h4>Update Status</h4>
              <select value={selectedOrder.status} onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
