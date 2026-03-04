import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import AuthRouter from './src/routes/authRoute.js';
import BusinessRouter from './src/routes/businessRoute.js';
import ReviewRouter from './src/routes/reviewRoute.js';
import AlertRouter from './src/routes/alertRoute.js';
import './src/configs/passport.js';
const app = express();

// Trust proxy for rate limiter if behind proxy (e.g., Heroku, Nginx)
app.set('trust proxy', 1);


// Body parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Cookie parsing
app.use(cookieParser());

// Passport initialization
app.use(passport.initialize());

// CORS setup - explicitly whitelist frontend origin(s)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const defaultAllowedOriginRegexList = [
  /^https:\/\/.*\.vercel\.app$/i,
  /^https:\/\/.*\.onrender\.com$/i,
  /^http:\/\/localhost:\d+$/i,
  /^http:\/\/127\.0\.0\.1:\d+$/i,
];

const configuredOriginRegexList = String(process.env.CLIENT_ORIGIN_REGEX || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => {
    try {
      return new RegExp(value);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

const allowedOriginRegexList =
  configuredOriginRegexList.length > 0 ? configuredOriginRegexList : defaultAllowedOriginRegexList;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (allowedOriginRegexList.some((regex) => regex.test(origin))) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ===== Rate limiting =====

// Global rate limiter (e.g., general API protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: process.env.NODE_ENV === 'production' ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  skip: (req) => {
    if (req.method !== 'GET') return false;
    const path = req.path || '';
    // Keep auth/public polling endpoints available so the app does not self-DOS.
    return (
      path === '/api/auth/me' ||
      path === '/api/public/stats' ||
      path === '/api/public/activity' ||
      path === '/api/public/feedback/recent'
    );
  },
});
app.use(globalLimiter);

// Stricter rate limiter for auth routes (login/register)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // Adjust as needed
  message: 'Too many login attempts, please try again later',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ===== Health check route =====
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// ===== Routes =====
app.use('/api/auth', AuthRouter);
app.use('/api/businesses', BusinessRouter);
app.use('/api/reviews', ReviewRouter);
app.use('/api/alerts', AlertRouter);


// ===== Export app =====
export default app;
