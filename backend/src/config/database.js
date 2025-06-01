const knex = require('knex');
const redis = require('redis');
const { logger } = require('../utils/logger');

// Database configuration
const dbConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'social_marketplace',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

// Initialize Knex
const db = knex(dbConfig);

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
};

// Initialize Redis client
let redisClient;

const initializeRedis = async () => {
  try {
    redisClient = redis.createClient(redisConfig);
    
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis ready for operations');
    });

    redisClient.on('end', () => {
      logger.warn('⚠️ Redis connection ended');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    // In development, continue without Redis
    if (process.env.NODE_ENV === 'development') {
      logger.warn('⚠️ Continuing without Redis in development mode');
      return null;
    }
    throw error;
  }
};

// Test database connection
const testDatabaseConnection = async () => {
  try {
    await db.raw('SELECT 1');
    logger.info('✅ Database connected successfully');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
};

// Initialize all connections
const initializeConnections = async () => {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Initialize Redis
    redisClient = await initializeRedis();

    logger.info('🎉 All database connections initialized successfully');
    return { db, redisClient };
  } catch (error) {
    logger.error('❌ Failed to initialize database connections:', error);
    throw error;
  }
};

// Graceful shutdown
const closeConnections = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('✅ Redis connection closed');
    }
    
    await db.destroy();
    logger.info('✅ Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connections:', error);
  }
};

// Cache helper functions
const cache = {
  get: async (key) => {
    if (!redisClient) return null;
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  set: async (key, value, ttl = 3600) => {
    if (!redisClient) return false;
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  },

  del: async (key) => {
    if (!redisClient) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  },

  exists: async (key) => {
    if (!redisClient) return false;
    try {
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  },
};

module.exports = {
  db,
  redisClient,
  cache,
  initializeConnections,
  closeConnections,
  testDatabaseConnection,
};