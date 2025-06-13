import crypto from 'crypto';

// Helper to get key/iv as Buffer and validate length
const getKeyAndIv = () => {
    const key = Buffer.from(process.env.AES_SECRET, 'utf8').slice(0, 32);
    const iv = Buffer.from(process.env.AES_IV, 'utf8').slice(0, 16);
    if (key.length !== 32) {
        throw new Error('AES_SECRET must be 32 bytes for aes-256-cbc');
    }
    if (iv.length !== 16) {
        throw new Error('AES_IV must be 16 bytes for aes-256-cbc');
    }
    return { key, iv };
};

export const encrypt = (text) => {
    if (typeof text !== 'string') throw new Error('Text to encrypt must be a string');
    try {
        const { key, iv } = getKeyAndIv();
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    } catch (err) {
        throw new Error('Encryption failed: ' + err.message);
    }
};

export const decrypt = (encrypted) => {
    if (typeof encrypted !== 'string') throw new Error('Encrypted data must be a string');
    try {
        const { key, iv } = getKeyAndIv();
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        throw new Error('Decryption failed');
    }
};