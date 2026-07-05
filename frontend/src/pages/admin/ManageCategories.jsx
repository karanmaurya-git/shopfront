import { useState } from 'react';
import api from '../../services/api';
import { useCategories } from '../../context/CategoryContext';
import { useToast } from '../../context/ToastContext';

const emptyForm = { name: '', icon: '🏷️', description: '' };

const COMMON_ICONS = ['👕', '👟', '📱', '💻', '🎧', '🏠', '🧴', '🍔', '📚', '🎮', '⌚', '👜', '🧸', '🚗', '🏋️', '🏷️'];

const ManageCategories = () => {
  const { categories, fetchCategories } = useCategories();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { showToast } = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        showToast('Category updated', 'success');
      } else {
        await api.post('/categories', form);
        showToast('Category added', 'success');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, icon: cat.icon, description: cat.description || '' });
    setEditingId(cat._id);
  };

  const confirmAndDelete = async () => {
    try {
      await api.delete(`/categories/${confirmDelete._id}`);
      showToast(`Removed "${confirmDelete.name}"`, 'success');
      setConfirmDelete(null);
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete category', 'error');
      setConfirmDelete(null);
    }
  };

  return (
    <div className="page">
      <h1>Manage Categories</h1>
      <p className="dim" style={{ marginBottom: 18 }}>
        Categories used for filtering products in the store. Renaming one automatically updates all products that use it.
      </p>
      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleSubmit} className="admin-form card-block">
        <div className="admin-form-fields">
          <input name="name" placeholder="Category name" value={form.name} onChange={handleChange} required />
          <input name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} />
        </div>
        <div className="icon-picker">
          <span className="dim" style={{ fontSize: '0.82rem' }}>Pick an icon:</span>
          <div className="icon-picker-grid">
            {COMMON_ICONS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                className={`icon-picker-btn ${form.icon === emoji ? 'icon-picker-btn-active' : ''}`}
                onClick={() => setForm({ ...form, icon: emoji })}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="btn-accent">{editingId ? 'Update Category' : 'Add Category'}</button>
          {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel edit</button>}
        </div>
      </form>

      {categories.length === 0 ? (
        <div className="empty-state">
          <p>No categories yet.</p>
          <span>Add your first one above — products can then be assigned to it.</span>
        </div>
      ) : (
        <div className="card-block">
          {categories.map((cat) => (
            <div key={cat._id} className="list-row">
              <div className="list-row-left">
                <div className="icon-avatar" style={{ background: 'var(--surface)' }}>{cat.icon}</div>
                <div>
                  <h4>{cat.name}</h4>
                  {cat.description && <p className="dim">{cat.description}</p>}
                </div>
              </div>
              <div className="list-row-right">
                <button className="btn-icon" onClick={() => handleEdit(cat)} title="Edit">✏️</button>
                <button className="btn-icon" onClick={() => setConfirmDelete(cat)} title="Remove">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Remove "{confirmDelete.name}"?</h3>
            <p>This only works if no products currently use this category.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Keep it</button>
              <button className="btn-remove" onClick={confirmAndDelete}>Remove category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
