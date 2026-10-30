import { Router } from 'express';
import { login, registrar, obtenerPerfil } from '../controllers/authController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Rutas públicas de autenticación
router.post('/login', login);

// En un entorno de producción, registrar puede protegerse o usarse solo para crear usuarios iniciales
router.post('/registro', registrar);

// Ruta protegida para validar sesión y obtener datos del usuario actual
router.get('/me', verificarToken, obtenerPerfil);

export default router;
