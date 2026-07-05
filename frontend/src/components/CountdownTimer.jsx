import { useState, useEffect } from 'react';

// Renders a live HH:MM:SS countdown to `endTime`. Calls onExpire once when it hits zero.
const CountdownTimer = ({ endTime, onExpire }) => {
  const calcRemaining = () => Math.max(0, new Date(endTime).getTime() - Date.now());
  const [remaining, setRemaining] = useState(calcRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (remaining <= 0) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <span className="countdown mono">
      ⏳ {hours > 0 && `${pad(hours)}:`}{pad(minutes)}:{pad(seconds)}
    </span>
  );
};

export default CountdownTimer;
