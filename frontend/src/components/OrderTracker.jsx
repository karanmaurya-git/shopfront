const STEPS = [
  { key: 'pending', label: 'Placed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

const OrderTracker = ({ status }) => {
  if (status === 'cancelled') {
    return <div className="order-tracker order-tracker-cancelled">❌ Order cancelled</div>;
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="order-tracker">
      {STEPS.map((step, idx) => (
        <div key={step.key} className="tracker-step">
          <div className="tracker-line-wrap">
            {idx > 0 && <span className={`tracker-line ${idx <= currentIndex ? 'tracker-line-done' : ''}`} />}
            <span className={`tracker-dot ${idx <= currentIndex ? 'tracker-dot-done' : ''}`}>
              {idx <= currentIndex ? '✓' : idx + 1}
            </span>
          </div>
          <span className={`tracker-label ${idx <= currentIndex ? 'tracker-label-done' : ''}`}>{step.label}</span>
        </div>
      ))}
    </div>
  );
};

export default OrderTracker;
