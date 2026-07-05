import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useCategories } from '../context/CategoryContext';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const { categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async (query = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: query ? { search: query } : {} });
      setProducts(data);
      setError('');
    } catch (err) {
      setError('Could not load products. Check that the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const visibleProducts = useMemo(() => {
    let list = [...products];
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [products, activeCategory, sort]);

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">EVERYTHING, TAGGED &amp; READY</div>
        <h1 className="hero-title">Shop the shelf.<br />Skip the markup.</h1>
        <p className="hero-sub">Browse the full catalog, add to cart, checkout — no gimmicks, just goods.</p>
        <form onSubmit={handleSearch} className="search-bar hero-search">
          <input
            type="text"
            placeholder="Search for a product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </section>

      <div className="page">
        <div className="toolbar">
          <div className="chip-row">
            <button
              className={`chip ${activeCategory === 'all' ? 'chip-active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                className={`chip ${activeCategory === c.name ? 'chip-active' : ''}`}
                onClick={() => setActiveCategory(c.name)}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        {loading && <p className="loading">Loading products...</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && visibleProducts.length === 0 && (
          <div className="empty-state">
            <p>Nothing here yet.</p>
            <span>Try a different category, or check back once products are added.</span>
          </div>
        )}

        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
