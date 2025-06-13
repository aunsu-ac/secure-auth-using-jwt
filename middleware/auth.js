import { getTokenData } from '../services/redis.js';
import { verifyToken } from '../utils/jwt.js';
import { decrypt, } from '../utils/crypto.js';

export const authenticateToken = async(req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ valid: false, error: 'Authorization token required' });
    }

    let tokenData;
    try {
        tokenData = await getTokenData(token);
    } catch (e) {
        return res.status(401).json({ valid: false, error: 'Token lookup failed' });
    }
    if (!tokenData) {
        return res.status(401).json({ valid: false, error: 'Invalid token!' });
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