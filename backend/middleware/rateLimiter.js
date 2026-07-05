const rateLimit = require('express-rate-limit');

// Limits login/register attempts to slow down brute-force / credential-stuffing attempts.
// 15 attempts per 15 minutes per IP — generous for real users, tight for automated attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
