import prisma from '../utils/prisma.js';

/**
 * Obtiene o inicializa la configuración única del negocio (Singleton pattern)
 */
const getOrCreateConfig = async () => {
  let config = await prisma.configuracion.findFirst();
  if (!config) {
    const defaultPhone = process.env.WHATSAPP_PHONE_NUMBER || '584120000000';
    config = await prisma.configuracion.create({
      data: {
        whatsappPhone: defaultPhone,
        mensajePlantilla: '¡Hola! Me interesa este producto: {nombre} - SKU: {sku} - Precio: ${pvp}',
        nombreTienda: 'CHESKY Bisutería & Accesorios',
        instagram: '@chesky.joyas',
        monedaSecundariaActiva: false,
        monedaSecundariaSimbolo: 'Bs.',
        tasaCambio: 0,
        notificarBajoStock: true,
        umbralBajoStock: 3,
      },
    });
  }
  return config;
};

/**
 * 1. OBTENER CONFIGURACIÓN PÚBLICA (Para clientes y catálogo)
 * Seguridad: Solo expone los datos necesarios para venta y contacto
 */
export const obtenerConfiguracionPublica = async (req, res, next) => {
  try {
    const config = await getOrCreateConfig();
    return res.status(200).json({
      success: true,
      config: {
        whatsappPhone: config.whatsappPhone,
        mensajePlantilla: config.mensajePlantilla,
        nombreTienda: config.nombreTienda,
        instagram: config.instagram,
        monedaSecundariaActiva: config.monedaSecundariaActiva,
        monedaSecundariaSimbolo: config.monedaSecundariaSimbolo,
        tasaCambio: config.tasaCambio,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. OBTENER CONFIGURACIÓN COMPLETA (Panel Administrador)
 */
export const obtenerConfiguracionAdmin = async (req, res, next) => {
  try {
    const config = await getOrCreateConfig();
    return res.status(200).json({
      success: true,
      config,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. ACTUALIZAR CONFIGURACIÓN DEL NEGOCIO (Solo Administrador)
 */
export const actualizarConfiguracion = async (req, res, next) => {
  try {
    const {
      whatsappPhone,
      mensajePlantilla,
      nombreTienda,
      instagram,
      monedaSecundariaActiva,
      monedaSecundariaSimbolo,
      tasaCambio,
      notificarBajoStock,
      umbralBajoStock,
    } = req.body;

    const configActual = await getOrCreateConfig();

    // Limpiar número de teléfono (solo dígitos, asegurar código de país)
    let cleanPhone = configActual.whatsappPhone;
    if (whatsappPhone !== undefined) {
      cleanPhone = String(whatsappPhone).replace(/[^0-9]/g, '');
    }

    const configActualizada = await prisma.configuracion.update({
      where: { id: configActual.id },
      data: {
        whatsappPhone: cleanPhone,
        ...(mensajePlantilla !== undefined && { mensajePlantilla: mensajePlantilla.trim() }),
        ...(nombreTienda !== undefined && { nombreTienda: nombreTienda.trim() }),
        ...(instagram !== undefined && { instagram: instagram.trim() }),
        ...(monedaSecundariaActiva !== undefined && {
          monedaSecundariaActiva: Boolean(monedaSecundariaActiva),
        }),
        ...(monedaSecundariaSimbolo !== undefined && {
          monedaSecundariaSimbolo: monedaSecundariaSimbolo.trim() || 'Bs.',
        }),
        ...(tasaCambio !== undefined && { tasaCambio: Math.max(0, parseFloat(tasaCambio) || 0) }),
        ...(notificarBajoStock !== undefined && {
          notificarBajoStock: Boolean(notificarBajoStock),
        }),
        ...(umbralBajoStock !== undefined && {
          umbralBajoStock: Math.max(1, parseInt(umbralBajoStock, 10) || 3),
        }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Configuración de negocio actualizada exitosamente.',
      config: configActualizada,
    });
  } catch (error) {
    next(error);
  }
};
