import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ManageAdmins = () => {
  const [users, setUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const fetchUsers = async () => {
    const { data } = await api.get('/users');
    setUsers(data);
    setLoaded(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/users/${u._id}/role`, { role: newRole });
      showToast(
        newRole === 'admin' ? `${u.name} is now an admin` : `${u.name} is no longer an admin`,
        'success'
      );
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update role', 'error');
    }
  };

  const toggleActive = async (u) => {
    const newStatus = !u.isActive;
    if (newStatus === false && !confirm(`Deactivate ${u.name}? They won't be able to log in until reactivated.`)) return;
    try {
      await api.put(`/users/${u._id}/status`, { isActive: newStatus });
      showToast(newStatus ? `${u.name} reactivated` : `${u.name} deactivated`, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update account status', 'error');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <h1>Manage Users</h1>
      <p className="dim" style={{ marginBottom: 18 }}>
        Promote users to admin, or deactivate an account instead of deleting it — their order history stays intact and it can be reversed anytime.
      </p>
      <input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 320, marginBottom: 18 }}
      />
      <div className="card-block">
        {filtered.map((u) => {
          const isSelf = u._id === currentUser._id;
          const roleLocked = u.isOwner || isSelf;
          const deactivateLocked = u.isOwner || isSelf;
          return (
            <div key={u._id} className={`list-row ${!u.isActive ? 'list-row-inactive' : ''}`}>
              <div className="list-row-left">
                <div className="icon-avatar" style={{ background: u.role === 'admin' ? '#dcfce7' : 'var(--surface)' }}>
                  {u.role === 'admin' ? '🛡️' : '👤'}
                </div>
                <div>
                  <h4>
                    {u.name} {isSelf && <span className="dim">(you)</span>}
                    {!u.isActive && <span className="badge-sale-inline" style={{ marginLeft: 6 }}>DEACTIVATED</span>}
                  </h4>
                  <p className="dim">{u.email}</p>
                </div>
              </div>
              <div className="list-row-right">
                <span className={`order-status ${u.role === 'admin' ? 'status-delivered' : 'status-pending'}`}>
                  {u.role}
                </span>

                {u.isOwner ? (
                  <span className="protected-tag">🛡️ Protected owner</span>
                ) : roleLocked ? (
                  <span className="protected-tag">Can't change your own role</span>
                ) : (
                  <button
                    className={u.role === 'admin' ? 'btn-secondary' : 'btn-accent'}
                    onClick={() => toggleRole(u)}
                  >
                    {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                  </button>
                )}

                {deactivateLocked ? (
                  <span className="protected-tag">{u.isOwner ? '' : "Can't deactivate yourself"}</span>
                ) : (
                  <button
                    className={u.isActive ? 'btn-remove' : 'btn-secondary'}
                    onClick={() => toggleActive(u)}
                  >
                    {u.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {loaded && filtered.length === 0 && <p className="dim" style={{ padding: 20 }}>No users match your search.</p>}
      </div>
    </div>
  );
};

export default ManageAdmins;
