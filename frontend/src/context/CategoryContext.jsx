import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CategoryContext = createContext(null);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Look up a category's icon by name; falls back to a generic tag emoji
  const getIcon = (name) => categories.find((c) => c.name === name)?.icon || '🏷️';

  return (
    <CategoryContext.Provider value={{ categories, fetchCategories, getIcon }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
