import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { connectRedis, disconnectRedis } from './services/redis.js';
import { loadKeys } from './utils/jwt.js';
import authRoutes from './routes/auth.js';
import { swaggerOptions } from './swagger.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Define allowed domains for CORS and Helmet CSP
const allowedOrigins = [
    `${process.env.PROTOCOL}://${process.env.HOST_IP}:${process.env.PORT}`,
    'https://oauth.pstmn.io'
];

// CORS options delegate
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", ...allowedOrigins],
            scriptSrc: ["'self'", ...allowedOrigins, "'unsafe-inline'"],
            styleSrc: ["'self'", ...allowedOrigins, "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", ...allowedOrigins],
            connectSrc: ["'self'", ...allowedOrigins]
        }
    }
}));
app.use(rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS,
    max: process.env.RATE_LIMIT_MAX_REQUESTS
})); // per ip
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    // customfavIcon: '/logo.png',
    customSiteTitle: `${process.env.PROJECT_NAME || 'JWT Auth Demo'} API Documentation`,
    swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
    },
}));

// Routes
app.use('/', authRoutes);

// The following lines are the likely source of the MaxListenersExceededWarning
// If this file is imported or executed multiple times (e.g., by nodemon or tests),
// these listeners are added repeatedly, causing the warning.
process.on('SIGINT', async () => {
    await disconnectRedis();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await disconnectRedis();
    process.exit(0);
});

const startServer = async () => {
    try {
        await loadKeys();
        await connectRedis();
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PROTOCOL}://${process.env.HOST_IP}:${process.env.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// shutdown
process.on('SIGINT', async () => {
    await disconnectRedis();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await disconnectRedis();
    process.exit(0);
});

startServer();