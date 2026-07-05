import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err.message);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchWishlist();
    else setWishlist([]);
  }, [user, fetchWishlist]);

  const toggleWishlist = async (productId) => {
    const { data } = await api.post(`/wishlist/${productId}`);
    setWishlist(data.wishlist);
    return data.added;
  };

  const isWishlisted = (productId) => wishlist.some((p) => p._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
