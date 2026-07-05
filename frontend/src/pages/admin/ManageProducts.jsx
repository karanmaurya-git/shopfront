import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';
import { getSaleInfo } from '../../utils/sale';
import { getProductImages } from '../../utils/productImages';
import { useCategories } from '../../context/CategoryContext';

const emptyForm = { name: '', description: '', price: '', category: '', stock: '', images: [''], onSale: false, salePrice: '', saleEndsAt: '' };

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const { showToast } = useToast();
  const { categories, getIcon } = useCategories();

  const fetchProducts = async () => {
    const { data } = await api.get('/products');
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (index, value) => {
    const updated = [...form.images];
    updated[index] = value;
    setForm({ ...form, images: updated });
  };

  const addImageField = () => setForm({ ...form, images: [...form.images, ''] });

  const removeImageField = (index) => {
    const updated = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: updated.length > 0 ? updated : [''] });
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleImageChange(index, data.url);
      showToast('Image uploaded', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploadingIndex(null);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanImages = form.images.map((url) => url.trim()).filter(Boolean);
    const payload = {
      ...form,
      images: cleanImages,
      imageUrl: cleanImages[0] || '',
      price: Number(form.price),
      stock: Number(form.stock),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      saleEndsAt: form.saleEndsAt || undefined,
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        showToast('Product updated', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Product added', 'success');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    const existingImages = product.images && product.images.length > 0
      ? product.images
      : (product.imageUrl ? [product.imageUrl] : ['']);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: existingImages,
      onSale: product.onSale || false,
      salePrice: product.salePrice || '',
      saleEndsAt: product.saleEndsAt ? new Date(product.saleEndsAt).toISOString().slice(0, 16) : '',
    });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmAndDelete = async () => {
    try {
      await api.delete(`/products/${confirmDelete._id}`);
      showToast(`Removed "${confirmDelete.name}"`, 'success');
      setConfirmDelete(null);
      fetchProducts();
    } catch (err) {
      showToast('Could not delete product', 'error');
    }
  };

  return (
    <div className="page">
      <h1>Manage Products</h1>
      {error && <p className="form-error">{error}</p>}
      {categories.length === 0 && (
        <p className="form-error">
          You don't have any categories yet. <Link to="/admin/categories">Create one first</Link> before adding products.
        </p>
      )}

      <form onSubmit={handleSubmit} className="admin-form card-block">
        <div className="admin-form-fields">
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select a category...</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.icon} {c.name}</option>
            ))}
          </select>
          <input name="price" type="number" step="0.01" placeholder="Price (INR)" value={form.price} onChange={handleChange} required />
          <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        </div>

        <div className="image-fields">
          <span className="dim" style={{ fontSize: '0.82rem' }}>Product images — paste a URL or upload a file (first one is the main photo)</span>
          {form.images.map((url, idx) => (
            <div key={idx} className="image-field-row">
              <input
                placeholder={`Image URL ${idx + 1}`}
                value={url}
                onChange={(e) => handleImageChange(idx, e.target.value)}
              />
              <label className="upload-btn">
                {uploadingIndex === idx ? 'Uploading...' : '📤 Upload'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => handleFileUpload(idx, e.target.files[0])}
                  disabled={uploadingIndex !== null}
                  style={{ display: 'none' }}
                />
              </label>
              {url && <img className="image-field-preview" src={url} alt="" onError={(e) => (e.target.style.visibility = 'hidden')} />}
              {form.images.length > 1 && (
                <button type="button" className="btn-icon" onClick={() => removeImageField(idx)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-secondary btn-small" onClick={addImageField}>+ Add another image</button>
        </div>

        <div className="sale-fields">
          <label className="checkbox-label">
            <input type="checkbox" name="onSale" checked={form.onSale} onChange={handleChange} style={{ width: 'auto' }} />
            Put this product on a flash sale
          </label>
          {form.onSale && (
            <div className="admin-form-fields" style={{ marginTop: 10 }}>
              <input name="salePrice" type="number" step="0.01" placeholder="Sale price (INR)" value={form.salePrice} onChange={handleChange} required={form.onSale} />
              <input name="saleEndsAt" type="datetime-local" value={form.saleEndsAt} onChange={handleChange} required={form.onSale} />
            </div>
          )}
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="btn-accent">{editingId ? 'Update Product' : 'Add Product'}</button>
          {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel edit</button>}
        </div>
      </form>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products yet.</p>
          <span>Add your first one using the form above.</span>
        </div>
      ) : (
        <div className="card-block">
          {products.map((p) => {
            const icon = { emoji: getIcon(p.category), bg: 'var(--surface)' };
            const { onSale, effectivePrice } = getSaleInfo(p);
            const thumb = getProductImages(p)[0];
            return (
              <div key={p._id} className="list-row">
                <div className="list-row-left">
                  {thumb ? (
                    <img className="icon-avatar" src={thumb} alt="" />
                  ) : (
                    <div className="icon-avatar" style={{ background: icon.bg }}>{icon.emoji}</div>
                  )}
                  <div>
                    <h4>{p.name} {onSale && <span className="badge-sale-inline">SALE</span>}</h4>
                    <p className="dim">{p.category} · Stock: {p.stock}</p>
                  </div>
                </div>
                <div className="list-row-right">
                  <span className="mono price-tag">{formatINR(effectivePrice)}</span>
                  <button className="btn-icon" onClick={() => handleEdit(p)} title="Edit">✏️</button>
                  <button className="btn-icon" onClick={() => setConfirmDelete(p)} title="Remove">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Remove "{confirmDelete.name}"?</h3>
            <p>This can't be undone. It will no longer appear in the store.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Keep it</button>
              <button className="btn-remove" onClick={confirmAndDelete}>Remove product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
