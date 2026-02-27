import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import 'express-async-errors';
import { StatusCodes } from 'http-status-codes';
import swaggerUi from 'swagger-ui-express';
import { rateLimit } from 'express-rate-limit';

console.log('Loading app...');

try {
  import { AppError } from './utils/errors/AppError';
  import { errorHandler } from './middleware/errorHandler';
  import { auditLogger } from './middleware/audit/auditLogger';
  import { requestId } from './middleware/requestId';
  import { corsOptions } from './config/cors';
  import { swaggerSpec } from './config/swagger';
  import { apiMetrics } from './middleware/metrics';

  // Import routes
  import authRoutes from './routes/auth.routes';
  import patientRoutes from './routes/patient.routes';
  import imageRoutes from './routes/image.routes';
  import analysisRoutes from './routes/analysis.routes';
  import chatRoutes from './routes/chat.routes';
  import dashboardRoutes from './routes/dashboard.routes';
  import allocationRoutes from './routes/allocation.routes';
  import bedsRoutes from './routes/beds.routes';
  import patientApiRoutes from './routes/patient-api.routes';

  console.log('All imports successful');

  const app: Application = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // CORS configuration
  app.use(cors(corsOptions));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression() as any);

  // Request logging
  app.use(morgan('dev'));

  // Request ID for tracing
  app.use(requestId);

  // Audit logging for HIPAA compliance
  app.use(auditLogger);

  // API Metrics
  app.use('/metrics', apiMetrics);

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
    });
  });

  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // API Routes
  const apiPrefix = process.env.API_PREFIX || '/api';
  console.log(`Using API prefix: ${apiPrefix}`);

  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/patients`, patientApiRoutes); // Use the new API routes
  app.use(`${apiPrefix}/images`, imageRoutes);
  app.use(`${apiPrefix}/analysis`, analysisRoutes);
  app.use(`${apiPrefix}/chat`, chatRoutes);
  app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
  app.use(`${apiPrefix}/allocation`, allocationRoutes);
  app.use(`${apiPrefix}/beds`, bedsRoutes);

  // 404 handler
  app.use('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, StatusCodes.NOT_FOUND));
  });

  // Global error handler
  app.use(errorHandler);

  const PORT = process.env.PORT || 3001;
  console.log(`Attempting to start server on port ${PORT}...`);

  const server = app.listen(PORT, () => {
    console.log(`✅ Server successfully started on port ${PORT}`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Health check: httpalhost:${PORT}/health`);
    console.log(`👤 Patient API: http://localhost:${PORT}${apiPrefix}/patients`);
    console.log(`🛏️ Allocation API: http://localhost:${PORT}${apiPrefix}/allocation`);
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});
