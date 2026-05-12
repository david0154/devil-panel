const rateLimit = require('express-rate-limit');

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// API limiter for protected routes
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: 'Rate limit exceeded. Max 60 requests/minute.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, apiLimiter };
