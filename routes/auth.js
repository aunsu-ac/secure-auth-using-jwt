import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { deleteToken, storeToken } from '../services/redis.js';
import { signToken, } from '../utils/jwt.js';
import { encrypt } from '../utils/crypto.js';


const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Generate an asymmetric JWT and store in Redis
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: JWT generated and stored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
    try {
        const { userId } = req.body || {};
        const payload = {
            userId: userId || '12345',
            role: 'user',
            sub: userId || '12345',
        };
        const token = signToken(payload);
        const encryptedToken = encrypt(token);
        await storeToken(userId || '12345', encryptedToken);
        res.json({ token: encryptedToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /profile:
 *   post:
 *     summary: Verify an asymmetric JWT and retrieve userId
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: {}
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 userId:
 *                   type: string
 *                 payload:
 *                   type: object
 *       401:
 *         description: Invalid or deleted token
 */
router.post('/profile', authenticateToken, async (req, res) => {
    res.json({ valid: true, userId: req.user.userId, payload: req.user.payload });
});

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Mark an asymmetric JWT as deleted in Redis
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: {}
 *     responses:
 *       200:
 *         description: Token marked as deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Token not found
 *       500:
 *         description: Server error
 */
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const token = req.headers['authorization'].slice(7);
        const deleted = await deleteToken(token);
        if (!deleted) {
            return res.status(404).json({ error: 'Token not found' });
        }
        res.json({ success: true, message: 'Token marked as deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;