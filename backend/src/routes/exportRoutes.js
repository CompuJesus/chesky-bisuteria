import { Router } from 'express';
import { exportarInventarioCSV } from '../controllers/exportController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Exportación protegida por token
router.use(verificarToken);
router.get('/csv', exportarInventarioCSV);

export default router;
