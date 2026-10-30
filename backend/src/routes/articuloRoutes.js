import { Router } from 'express';
import {
  listarPublico,
  obtenerPorIdPublico,
  listarAdmin,
  crearArticulo,
  actualizarArticulo,
  eliminarArticulo,
  cambiarEstado,
  previsualizarCalculoPrecio,
} from '../controllers/articuloController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

// ==========================================
// RUTAS PÚBLICAS (Catálogo Modo Cliente)
// ==========================================
// Listado público optimizado (Costo y utilidad estrictamente excluidos)
router.get('/publico', listarPublico);
// Detalle individual público
router.get('/publico/:id', obtenerPorIdPublico);

// ==========================================
// RUTAS PRIVADAS (Panel Modo Administrador)
// ==========================================
router.use(verificarToken);

// Previsualización reactiva de cálculo de precios
router.post('/calcular-precio', previsualizarCalculoPrecio);

// CRUD de Artículos
router.get('/', listarAdmin);
router.post('/', upload.single('imagen'), crearArticulo);
router.put('/:id', upload.single('imagen'), actualizarArticulo);
router.patch('/:id/estado', cambiarEstado);
router.delete('/:id', eliminarArticulo);

export default router;
