import { createClient } from 'redis';
import { config } from '../config/index.js';

const redisClient = createClient({
    url: config.redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export async function connectRedis() {
    await redisClient.connect();
}

export async function storeToken(userId, token) {
    const key = `token:${token}`;
    const tokenData = { userId, deleted: false, type: 'asymmetric' };
    await redisClient.set(key, JSON.stringify(tokenData));
}

export async function getTokenData(token) {
    const key = `token:${token}`;
    const tokenData = await redisClient.get(key);
    if (!tokenData) return null;

    const parsed = JSON.parse(tokenData);
    return parsed.deleted ? null : parsed;
}

export async function deleteToken(token) {
    const key = `token:${token}`;
    const tokenData = await redisClient.get(key);
    if (!tokenData) return false;

    const parsed = JSON.parse(tokenData);
    parsed.deleted = true;
    await redisClient.set(key, JSON.stringify(parsed));
    return true;
}