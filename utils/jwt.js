import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import { config } from '../config/index.js';

let publicKey, privateKey;

export async function loadKeys() {
    publicKey = await fs.readFile('public.pem', 'utf8');
    privateKey = await fs.readFile('private.pem', 'utf8');
}

export function signToken(payload) {
    return jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '1h',
        issuer: config.issuer,
        audience: config.audience,
    });
}

export function verifyToken(token) {
    return jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: config.issuer,
        audience: config.audience,
    });
}