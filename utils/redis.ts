import { Redis } from 'ioredis';

// Track if Redis is available
let redisAvailable = true;
let redisClient: Redis | null = null;

// Get Redis client with error handling
const getRedisClient = () => {
  if (!redisAvailable) return null;
  
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      // Add a reasonable connection timeout
      connectTimeout: 5000,
      // Retry strategy to prevent excessive reconnection attempts
      retryStrategy: (times) => {
        if (times > 3) {
          redisAvailable = false;
          console.warn('Redis connection failed after multiple attempts. Caching disabled.');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000); // Retry with exponential backoff
      }
    });
    
    // Handle connection errors
    redis.on('error', (err) => {
      console.warn('Redis connection error:', err.message);
      if (err.message.includes('ECONNREFUSED')) {
        redisAvailable = false;
      }
    });
    
    // Log when connected successfully
    redis.on('connect', () => {
      console.log('Successfully connected to Redis');
      redisAvailable = true;
    });
    
    return redis;
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    redisAvailable = false;
    return null;
  }
};

// Get Redis client (singleton pattern)
export const getRedis = () => {
  if (!redisClient && redisAvailable) {
    redisClient = getRedisClient();
  }
  return redisClient;
};

// Cache helpers with fallback behavior
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`Error getting cache for key ${key}:`, error);
    return null;
  }
}

export async function setCache<T>(key: string, data: T, expireSeconds = 3600): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  
  try {
    await redis.set(key, JSON.stringify(data), 'EX', expireSeconds);
    return true;
  } catch (error) {
    console.warn(`Error setting cache for key ${key}:`, error);
    return false;
  }
}

export async function invalidateCache(key: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn(`Error invalidating cache for key ${key}:`, error);
    return false;
  }
}
