require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const { logger }  = require('./utils/logger');

// Route imports
const authRoutes     = require('./routes/auth');
const userRoutes     = require('./routes/users');
const serverRoutes   = require('./routes/servers');
const domainRoutes   = require('./routes/domains');
const dnsRoutes      = require('./routes/dns');
const sslRoutes      = require('./routes/ssl');
const emailRoutes    = require('./routes/email');
const backupRoutes   = require('./routes/backups');
const monitorRoutes  = require('./routes/monitor');
const billingRoutes  = require('./routes/billing');
const aiRoutes       = require('./routes/ai');
const wpRoutes       = require('./routes/wordpress');
const firewallRoutes = require('./routes/firewall');
const adminRoutes    = require('./routes/admin');
const securityRoutes = require('./routes/security');

const app  = express();
const PORT = process.env.APP_PORT || 8080;

// ── Security Middleware ─────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

app.use(cors({
  origin: (process.env.CORS_ALLOWED_ORIGINS || '*').split(','),
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Origin','Content-Type','Authorization','X-Request-ID']
}));

// Global rate limiter — 200 req/15min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// ── Trust proxy (for Nginx) ─────────────────────────────
app.set('trust proxy', 1);

// ── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Devil Panel API', version: '1.0.0', time: new Date() });
});

// ── API Routes ───────────────────────────────────────────
const v1 = '/api/v1';
app.use(`${v1}/auth`,      authRoutes);
app.use(`${v1}/users`,     userRoutes);
app.use(`${v1}/servers`,   serverRoutes);
app.use(`${v1}/domains`,   domainRoutes);
app.use(`${v1}/dns`,       dnsRoutes);
app.use(`${v1}/ssl`,       sslRoutes);
app.use(`${v1}/email`,     emailRoutes);
app.use(`${v1}/backups`,   backupRoutes);
app.use(`${v1}/monitoring`,monitorRoutes);
app.use(`${v1}/billing`,   billingRoutes);
app.use(`${v1}/ai`,        aiRoutes);
app.use(`${v1}/wordpress`, wpRoutes);
app.use(`${v1}/firewall`,  firewallRoutes);
app.use(`${v1}/admin`,     adminRoutes);
app.use(`${v1}/security`,  securityRoutes);

// ── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl}`);
  res.status(err.status || 500).json({
    error: process.env.APP_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.listen(PORT, () => {
  logger.info(`😈 Devil Panel API running on port ${PORT}`);
});

module.exports = app;
