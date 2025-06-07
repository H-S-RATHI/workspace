const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const config = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const marketplaceRoutes = require('./routes/marketplace');
const discoverRoutes = require('./routes/discover');
const profileRoutes = require('./routes/profile');
const statusRoutes = require('./routes/status');
const mediaRoutes = require('./routes/media');
const { initializeSocket } = require('./websocket/socketHandler');
const errorHandler = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Socket.IO setup with explicit configuration
const io = socketIo(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  // Important: This must match the client-side path
  path: '/socket.io/',
  // Allow both websocket and polling
  transports: ['websocket', 'polling'],
  // Don't serve the client files
  serveClient: false,
  // Enable compatibility with Socket.IO v2 clients
  allowEIO3: true,
  // Connection settings
  pingTimeout: 30000, // Increase timeout to 30s
  pingInterval: 25000,
  // Security settings
  cookie: false,
  // Enable HTTP compression
  httpCompression: true,
  // Enable WebSocket per-message deflate
  perMessageDeflate: {
    threshold: 1024, // Size threshold (in bytes)
    concurrencyLimit: 10
  },
  // Allow binary data
  allowEIO4: true,
  // Enable CORS for all methods
  allowRequest: (req, callback) => {
    // Additional request validation can be done here
    callback(null, true);
  }
});

// Initialize WebSocket handlers
initializeSocket(io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors(corsOptions));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, userRoutes);
app.use(`/api/${apiVersion}/chat`, chatRoutes);
app.use(`/api/${apiVersion}/marketplace`, marketplaceRoutes);
app.use(`/api/${apiVersion}/discover`, discoverRoutes);
app.use(`/api/${apiVersion}/profile`, profileRoutes);
app.use(`/api/${apiVersion}/status`, statusRoutes);
app.use(`/api/${apiVersion}/media`, mediaRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 12000;
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  logger.info(`📡 Socket.IO server initialized`);
  logger.info(`🔗 API available at http://localhost:${PORT}/api/${apiVersion}`);
});

module.exports = { app, server, io };