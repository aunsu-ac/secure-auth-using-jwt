import { getTokenData } from '../services/redis.js';
import { verifyToken } from '../utils/jwt.js';
import { decrypt, } from '../utils/crypto.js';

export async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ valid: false, error: 'Authorization token required' });
    }

    const tokenData = await getTokenData(token);
    if (!tokenData) {
        return res.status(401).json({ valid: false, error: 'Token not found or deleted' });
    }

    try {
        const decryptedToken = decrypt(token);
        const decoded = verifyToken(decryptedToken);
        req.user = { userId: tokenData.userId, payload: decoded };
        next();
    } catch (error) {
        return res.status(401).json({ valid: false, error: error.message });
    }
}