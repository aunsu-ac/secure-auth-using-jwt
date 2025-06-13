import dotenv from 'dotenv';

dotenv.config();

export const config = {
    projectName: process.env.PROJECT_NAME || 'JWT Auth Demo',
    port: process.env.PORT || 3000,
    redisUrl: process.env.REDIS_URL,
    aesSecret: Buffer.from(process.env.AES_SECRET.slice(0, 32)), // Ensure 32 bytes
    aesIv: Buffer.from(process.env.AES_IV), // Ensure 16 bytes
    issuer: 'http://localhost:3000',
    audience: 'http://localhost:3000/client',
};