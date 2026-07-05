// Formats a number as Indian Rupees, e.g. 1499 -> "₹1,499", 49.5 -> "₹49.50"
export const formatINR = (amount) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
};
