import { Router } from 'express';
import { login, registrar, obtenerPerfil, cambiarPassword } from '../controllers/authController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Rutas públicas de autenticación
router.post('/login', login);
router.post('/registro', registrar);

// Rutas protegidas
router.get('/me', verificarToken, obtenerPerfil);
router.put('/cambiar-password', verificarToken, cambiarPassword);

export default router;
