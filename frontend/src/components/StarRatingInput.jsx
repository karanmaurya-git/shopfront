import { useState } from 'react';

// Interactive star picker for writing a review.
const StarRatingInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <span className="star-rating-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= (hover || value) ? 'star star-filled' : 'star'}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          ★
        </span>
      ))}
    </span>
  );
};

export default StarRatingInput;
