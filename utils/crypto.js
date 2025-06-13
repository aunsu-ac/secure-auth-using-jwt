import crypto from 'crypto';
import { config } from '../config/index.js';

export function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', config.aesSecret, config.aesIv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

export function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', config.aesSecret, config.aesIv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}