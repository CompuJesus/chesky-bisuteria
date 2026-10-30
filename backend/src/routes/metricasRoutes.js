import { Router } from 'express';
import { obtenerMetricasDashboard } from '../controllers/metricasController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las métricas financieras son de acceso privado
router.use(verificarToken);
router.get('/', obtenerMetricasDashboard);

export default router;
