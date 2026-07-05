// Returns { onSale, effectivePrice, saleEndsAt } for a product, accounting for expiry.
export const getSaleInfo = (product) => {
  const saleActive = !!(
    product.onSale &&
    product.salePrice != null &&
    product.saleEndsAt &&
    new Date(product.saleEndsAt) > new Date()
  );
  return {
    onSale: saleActive,
    effectivePrice: saleActive ? product.salePrice : product.price,
    saleEndsAt: product.saleEndsAt,
  };
};
