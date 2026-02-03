/**
 * AI Learning Hub - Express Application
 * Main app configuration and middleware setup
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import progressRoutes from './routes/progress.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// CORS configuration - MUST be before other middleware for mobile compatibility
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all vercel.app subdomains
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Allow configured origins
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    if (allowedOrigins.some(allowed => origin === allowed || allowed === '*')) {
      return callback(null, true);
    }
    
    // In production, be more permissive to avoid mobile issues
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours - cache preflight requests
};

// Apply CORS before everything else
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Security middleware - configured for mobile compatibility
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  contentSecurityPolicy: false, // Disable CSP for API server
}));

// Rate limiting - more lenient for mobile
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Learning Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/progress', progressRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AI Learning Hub API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
