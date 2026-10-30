import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import articuloRoutes from './routes/articuloRoutes.js';
import metricasRoutes from './routes/metricasRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Seguridad con Helmet (permitiendo carga de imágenes cruzadas)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Habilitar CORS para comunicación fluida con el frontend
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin,
    credentials: true,
  })
);

// Logging de peticiones HTTP
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parseo de cuerpo JSON y formularios
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos locales de subidas (fallback para desarrollo offline)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Endpoint de verificación de estado del servicio
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'CHESKY Bisutería API',
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/articulos', articuloRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/exportar', exportRoutes);

// Manejador centralizado de errores
app.use(errorHandler);

export default app;
