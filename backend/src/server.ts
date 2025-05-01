import express, { Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import pinoHttp from 'pino-http';
import logger from './config/logger';
import { vehicleRoutes } from './routes/vehicle.routes';
import { webhookRoutes } from './routes/webhook.routes';
import sellerRoutes from './routes/seller.routes';
import vehicleImageRoutes from './routes/vehicle-image.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { swaggerSpec } from './config/swagger';
import path from 'path';
import { paymentSimulationRoutes } from './routes/payment-simulation.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração CORS para aceitar todas as origens
const corsOptions = {
  origin: '*', // Aceita todas as origens 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 1 dia em segundos
};

// Configuração do middleware pino-http usando nosso logger
const httpLogger = pinoHttp({ logger });

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(httpLogger);

// Adicionar middleware global para controle de cache
app.use((req, res, next) => {
  // Adicionar cabeçalhos para evitar cache para rotas da API
  if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Middleware de log para diagnóstico
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Headers:', JSON.stringify(req.headers));
  next();
});

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/vehicle-images', vehicleImageRoutes);
app.use('/api/payments', paymentSimulationRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// CORS preflight para todas as rotas
app.options('*', cors(corsOptions));

// Error middleware (deve ser o último middleware)
app.use(errorMiddleware);

// Garantir que PORT seja um número
const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;

app.listen(portNumber, '0.0.0.0', () => {
  logger.info(`Servidor rodando na porta ${portNumber}`);
  logger.info(`Documentação Swagger disponível em http://localhost:${portNumber}/api-docs`);
  logger.info('CORS habilitado para todas as origens');
}); 