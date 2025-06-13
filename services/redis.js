import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async () => {
    await redisClient.connect();
};

export const disconnectRedis = async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
};

export const storeToken = async (userId, token) => {
    if (!userId || !token) throw new Error('userId and token required');
    const key = `token:${token}`;
    const tokenData = { userId, deleted: false, type: 'asymmetric' };
    await redisClient.set(key, JSON.stringify(tokenData));
};

export const getTokenData = async (token) => {
    if (!token) return null;
    const key = `token:${token}`;
    const tokenData = await redisClient.get(key);
    if (!tokenData) return null;

    const parsed = JSON.parse(tokenData);
    return parsed.deleted ? null : parsed;
};

export const deleteToken = async (token) => {
    if (!token) return false;
    const key = `token:${token}`;
    const tokenData = await redisClient.get(key);
    if (!tokenData) return false;

    const parsed = JSON.parse(tokenData);
    parsed.deleted = true;
    await redisClient.set(key, JSON.stringify(parsed));
    return true;
};