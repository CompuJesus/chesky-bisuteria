import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

export const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Acceso no autorizado. Token de sesión no proporcionado.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'chesky_jewelry_jwt_secret_dev_key_2026_supersecure';

    const decoded = jwt.verify(token, secret);

    // Verificar existencia del usuario en la BD para evitar tokens huérfanos
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Sesión inválida. El usuario ya no existe en el sistema.',
      });
    }

    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación inválido.',
    });
  }
};

/**
 * Middleware para restringir por roles (ej: ADMIN)
 */
export const autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes los permisos requeridos para realizar esta acción.',
      });
    }
    next();
  };
};
