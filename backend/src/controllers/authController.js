import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor ingresa tanto el correo electrónico como la contraseña.',
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Verifica tu correo o contraseña.',
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Verifica tu correo o contraseña.',
      });
    }

    const secret = process.env.JWT_SECRET || 'chesky_jewelry_jwt_secret_dev_key_2026_supersecure';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
      secret,
      { expiresIn }
    );

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registrar = async (req, res, next) => {
  try {
    const { email, nombre, password, rol } = req.body;

    if (!email || !nombre || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, email y contraseña son obligatorios.',
      });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        error: 'El correo electrónico ya se encuentra registrado.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email: email.toLowerCase().trim(),
        nombre: nombre.trim(),
        password: passwordHash,
        rol: rol && ['ADMIN', 'OPERADOR'].includes(rol) ? rol : 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      usuario: nuevoUsuario,
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerPerfil = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      usuario: req.user,
    });
  } catch (error) {
    next(error);
  }
};
