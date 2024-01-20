const Redis = require('ioredis');

// Replace these values with your Redis server configuration
const redisOptions = {
    host: '127.0.0.1', // e.g., '127.0.0.1'
    port: 6379, // default Redis port
};

// Create a new Redis client
const redisClient = new Redis(redisOptions);

// Log connection event
redisClient.on('connect', () => {
    console.log('Redis Connected');
});

// Log disconnection event
redisClient.on('close', () => {
    console.log('Redis Disconnected.');
});

// Log error events
redisClient.on('error', (error) => {
    console.error('Redis error:', error);
});

module.exports = redisClient;