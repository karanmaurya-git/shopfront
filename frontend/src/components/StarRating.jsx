// Read-only star display: renders 5 stars, filled up to `rating` (supports .5 via rounding).
const StarRating = ({ rating = 0, count, size = 'md' }) => {
  const rounded = Math.round(rating);
  return (
    <span className={`star-rating star-rating-${size}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? 'star star-filled' : 'star'}>★</span>
      ))}
      {typeof count === 'number' && <span className="star-count">({count})</span>}
    </span>
  );
};

export default StarRating;
