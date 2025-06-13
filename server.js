import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config/index.js';
import { connectRedis } from './services/redis.js';
import { loadKeys } from './utils/jwt.js';
import authRoutes from './routes/auth.js';
import { swaggerOptions } from './swagger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customfavIcon: '/logo.png',
    customSiteTitle: `${config.projectName} API Documentation`,
    swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
    },
}));

// Routes
app.use('/', authRoutes);

const startServer = async () => {
    try {
        await loadKeys();
        await connectRedis();
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();