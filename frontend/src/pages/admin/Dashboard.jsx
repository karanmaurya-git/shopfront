import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import { formatINR } from '../../utils/currency';

// Builds a day-by-day revenue series for the last `days` days from raw orders
const buildRevenueSeries = (orders, days = 7) => {
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayTotal = orders
      .filter((o) => o.status !== 'cancelled')
      .filter((o) => {
        const created = new Date(o.createdAt);
        return created >= date && created < nextDate;
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);

    series.push({
      label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: dayTotal,
    });
  }
  return series;
};

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0, revenue: 0 });
  const [chartData, setChartData] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/orders')]).then(([p, o]) => {
      const revenue = o.data
        .filter((ord) => ord.status !== 'cancelled')
        .reduce((sum, ord) => sum + ord.totalAmount, 0);
      setStats({
        products: p.data.length,
        orders: o.data.length,
        pending: o.data.filter((ord) => ord.status === 'pending').length,
        revenue,
      });
      setChartData(buildRevenueSeries(o.data, 7));
      setLowStock(p.data.filter((prod) => prod.stock <= 5).sort((a, b) => a.stock - b.stock));
    });
  }, []);

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <div className="card-block stat-overview">
        <div className="stat-overview-main">
          <span className="dim">TOTAL REVENUE</span>
          <span className="stat-big mono">{formatINR(stats.revenue)}</span>
        </div>
        <div className="stat-overview-dots">
          <span><i className="dot" style={{ background: '#10b981' }} />Products {stats.products}</span>
          <span><i className="dot" style={{ background: '#f59e0b' }} />Pending {stats.pending}</span>
          <span><i className="dot" style={{ background: '#3b82f6' }} />Orders {stats.orders}</span>
        </div>
      </div>

      <div className="card-block chart-card">
        <h3>Revenue — last 7 days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--dim)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--dim)' }} width={70} tickFormatter={(v) => formatINR(v)} />
            <Tooltip formatter={(value) => formatINR(value)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8 }} />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {lowStock.length > 0 && (
        <div className="card-block low-stock-card">
          <h3>⚠️ Low stock ({lowStock.length})</h3>
          {lowStock.map((p) => (
            <div key={p._id} className="list-row">
              <div className="list-row-left">
                <div>
                  <h4>{p.name}</h4>
                  <p className="dim">{p.category}</p>
                </div>
              </div>
              <div className="list-row-right">
                <span className={`stock-badge ${p.stock === 0 ? 'stock-badge-empty' : 'stock-badge-low'}`}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-links">
        <Link to="/admin/products" className="admin-link-card">📦<br />Manage Products</Link>
        <Link to="/admin/categories" className="admin-link-card">🗂️<br />Manage Categories</Link>
        <Link to="/admin/orders" className="admin-link-card">🧾<br />Manage Orders</Link>
        <Link to="/admin/admins" className="admin-link-card">🛡️<br />Manage Admins</Link>
      </div>
    </div>
  );
};

export default Dashboard;
