// Combines the legacy single `imageUrl` with the new `images` array,
// so old products (single image) and new products (gallery) both work.
export const getProductImages = (product) => {
  const gallery = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  if (gallery.length > 0) return gallery;
  return product.imageUrl ? [product.imageUrl] : [];
};
