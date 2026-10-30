import { Router } from 'express';
import {
  obtenerConfiguracionPublica,
  obtenerConfiguracionAdmin,
  actualizarConfiguracion,
} from '../controllers/configuracionController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Endpoint público para que el catálogo de clientes obtenga el WhatsApp actual y tasa
router.get('/publica', obtenerConfiguracionPublica);

// Endpoints protegidos para el Administrador
router.use(verificarToken);
router.get('/', obtenerConfiguracionAdmin);
router.put('/', actualizarConfiguracion);

export default router;
