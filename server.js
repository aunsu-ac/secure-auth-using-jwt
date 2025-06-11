import express from 'express';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import crypto from 'crypto';

const SYMMETRIC_SECRET = 'your-256-bit-secret-key-32byteslong';
let publicKey, privateKey;

// AES key and IV for encrypting JWTs (for demo, use env in production)
const AES_SECRET = Buffer.from('aes-256-cbc-demo-key-32byteslong!!'.slice(0, 32)); // 32 bytes Buffer
const AES_IV = Buffer.from('1234567890123456'); // 16 bytes Buffer

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'JWT Demo API',
            version: '1.0.0',
            description: 'API documentation for JWT Demo Project',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const loadKeys = async () => {
    publicKey = await fs.readFile('public.pem', 'utf8');
    privateKey = await fs.readFile('private.pem', 'utf8');
};

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', AES_SECRET, AES_IV);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', AES_SECRET, AES_IV);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * @swagger
 * /symmetric/generate:
 *   post:
 *     summary: Generate a symmetric JWT
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               iss:
 *                 type: string
 *                 description: Issuer of the token
 *               sub:
 *                 type: string
 *                 description: Subject of the token
 *               aud:
 *                 type: string
 *                 description: Audience of the token
 *     responses:
 *       200:
 *         description: JWT generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
app.post('/symmetric/generate', async (req, res) => {
    try {
        const { userId, iss, sub, aud } = req.body || {};
        const payload = {
            userId: userId || '12345',
            role: 'user',
            iss: iss || 'jwt-demo-server',
            sub: sub || userId || '12345',
            aud: aud || 'jwt-demo-client'
        };
        const token = jwt.sign(payload, SYMMETRIC_SECRET, {
            algorithm: 'HS256',
            expiresIn: '1h',
        });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /symmetric/verify:
 *   post:
 *     summary: Verify a symmetric JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
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
 *                 decoded:
 *                   type: object
 *       401:
 *         description: Invalid token
 */
app.post('/symmetric/verify', async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = jwt.verify(token, SYMMETRIC_SECRET);
        res.json({ valid: true, decoded });
    } catch (error) {
        res.status(401).json({ valid: false, error: error.message });
    }
});

/**
 * @swagger
 * /asymmetric/generate:
 *   post:
 *     summary: Generate an asymmetric JWT
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               iss:
 *                 type: string
 *                 description: Issuer of the token
 *               sub:
 *                 type: string
 *                 description: Subject of the token
 *               aud:
 *                 type: string
 *                 description: Audience of the token
 *     responses:
 *       200:
 *         description: JWT generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
app.post('/asymmetric/generate', async (req, res) => {
    try {
        const { userId, iss, sub, aud } = req.body || {};
        const payload = {
            userId: userId || '12345',
            role: 'user',
            iss: iss || 'jwt-demo-server',
            sub: sub || userId || '12345',
            aud: aud || 'jwt-demo-client'
        };
        const token = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
        });
        const encryptedToken = encrypt(token);
        res.json({ token: encryptedToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /asymmetric/verify:
 *   post:
 *     summary: Verify an asymmetric JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
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
 *                 payload:
 *                   type: object
 *       401:
 *         description: Invalid token
 */
app.post('/asymmetric/verify', async (req, res) => {
    try {
        const { token } = req.body;
        const decryptedToken = decrypt(token);
        const decoded = jwt.verify(decryptedToken, publicKey, {
            algorithms: ['RS256'],
            audience: 'jwt-demo-client',
            issuer: 'jwt-demo-server',
        });
        res.json({ valid: true, payload: decoded });
    } catch (error) {
        res.status(401).json({ valid: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await loadKeys();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();