import dotenv from 'dotenv';
dotenv.config();

export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'JWT Authentication API',
            version: '1.0.0',
            description: 'This project demonstrates asymmetric JWT token generation, verification, and storage in Redis, using environment variables for configuration. Tokens are AES-256-CBC encrypted, use RS256 (RSA key pair), and are managed via REST endpoints. See README for details.',
        },
        servers: [
            { url: `${process.env.PROTOCOL}://${process.env.HOST_IP}:${process.env.PORT}` },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                RedisToken: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        deleted: { type: 'boolean' }
                    },
                },
                RedisUserProfile: {
                    type: 'object',
                    properties: {
                        profileId: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string', format: 'email' }
                    },
                },
            },
        },
    },
    apis: ['./routes/auth.js'],
};