const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

const orderConfirmationEmail = (order, userName) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
    <h2 style="color: #12172a;">Thanks for your order, ${userName}!</h2>
    <p>Order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> has been placed.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      ${order.items
        .map(
          (item) => `
        <tr>
          <td style="padding: 6px 0; border-bottom: 1px solid #eee;">${item.name} × ${item.quantity}</td>
          <td style="padding: 6px 0; border-bottom: 1px solid #eee; text-align: right;">${formatINR(item.price * item.quantity)}</td>
        </tr>`
        )
        .join('')}
      <tr>
        <td style="padding: 10px 0; font-weight: bold;">Total</td>
        <td style="padding: 10px 0; font-weight: bold; text-align: right;">${formatINR(order.totalAmount)}</td>
      </tr>
    </table>
    <p>Payment method: Cash on Delivery</p>
    ${order.estimatedDelivery ? `<p>Estimated delivery: ${new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</p>` : ''}
    <p style="color: #6b7280; font-size: 0.85rem; margin-top: 24px;">— Shopfront</p>
  </div>
`;

const orderStatusEmail = (order, userName) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
    <h2 style="color: #12172a;">Your order is ${order.status}</h2>
    <p>Hi ${userName}, order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> has been updated to: <strong>${order.status}</strong>.</p>
    ${order.status === 'delivered' ? '<p>We hope you enjoy your purchase!</p>' : ''}
    <p style="color: #6b7280; font-size: 0.85rem; margin-top: 24px;">— Shopfront</p>
  </div>
`;

module.exports = { orderConfirmationEmail, orderStatusEmail };
