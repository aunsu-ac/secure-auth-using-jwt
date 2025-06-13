import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';

let publicKey, privateKey;

export const loadKeys = async () => {
    publicKey = await fs.readFile('public.pem', 'utf8');
    privateKey = await fs.readFile('private.pem', 'utf8');
};

export const signToken = (payload) => {
    return jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        issuer: `${process.env.PROTOCOL}://${process.env.HOST_IP}:${process.env.PORT}`,
        audience: process.env.AUDIENCE,
    });
};

export const verifyToken = (token) => {
    return jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: `${process.env.PROTOCOL}://${process.env.HOST_IP}:${process.env.PORT}`,
        audience: process.env.AUDIENCE,
    });
};