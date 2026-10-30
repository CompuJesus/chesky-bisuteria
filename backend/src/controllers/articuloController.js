import prisma from '../utils/prisma.js';
import { calcularPVP, validarParametrosPrecio } from '../services/pricingService.js';
import { processUploadedImage, deleteFromStorage } from '../middlewares/uploadMiddleware.js';

/**
 * 1. LISTAR CATÁLOGO PÚBLICO (Modo Cliente)
 * Seguridad: Excluye estrictamente costoBase y utilidad.
 * Filtra por categoría, término de búsqueda (nombre o SKU) y oculta los no visibles.
 */
export const listarPublico = async (req, res, next) => {
  try {
    const { categoria, q, page = 1, limit = 12 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Filtros de búsqueda
    const where = {
      // Los artículos ocultos NUNCA se muestran en el catálogo del cliente
      estado: {
        not: 'Oculto',
      },
    };

    if (categoria && categoria !== 'Todas') {
      where.categoria = categoria;
    }

    if (q && q.trim()) {
      const termino = q.trim();
      where.OR = [
        { nombre: { contains: termino, mode: 'insensitive' } },
        { sku: { contains: termino, mode: 'insensitive' } },
        { descripcion: { contains: termino, mode: 'insensitive' } },
      ];
    }

    const [articulos, total] = await Promise.all([
      prisma.articulo.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          // Mostrar primero disponibles y luego agotados
          { estado: 'asc' },
          { fechaActualizacion: 'desc' },
        ],
        // PROYECCIÓN ESTRICTA: Solo campos públicos. Costo y utilidad están excluidos.
        select: {
          id: true,
          sku: true,
          nombre: true,
          categoria: true,
          descripcion: true,
          pvp: true,
          stock: true,
          imagenUrl: true,
          estado: true,
          fechaActualizacion: true,
        },
      }),
      prisma.articulo.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: articulos,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. OBTENER DETALLE PÚBLICO DE UN ARTÍCULO
 */
export const obtenerPorIdPublico = async (req, res, next) => {
  try {
    const { id } = req.params;

    const articulo = await prisma.articulo.findFirst({
      where: {
        id,
        estado: { not: 'Oculto' },
      },
      select: {
        id: true,
        sku: true,
        nombre: true,
        categoria: true,
        descripcion: true,
        pvp: true,
        stock: true,
        imagenUrl: true,
        estado: true,
        fechaActualizacion: true,
      },
    });

    if (!articulo) {
      return res.status(404).json({
        success: false,
        error: 'El artículo no existe o no está disponible en este momento.',
      });
    }

    return res.status(200).json({
      success: true,
      data: articulo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. LISTAR INVENTARIO COMPLETO (Modo Administrador)
 * Incluye métricas de costos, utilidad y filtros avanzados.
 */
export const listarAdmin = async (req, res, next) => {
  try {
    const { categoria, estado, q, page = 1, limit = 20, sortBy = 'fechaActualizacion', sortOrder = 'desc' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (categoria && categoria !== 'Todas') {
      where.categoria = categoria;
    }

    if (estado && estado !== 'Todos') {
      where.estado = estado;
    }

    if (q && q.trim()) {
      const termino = q.trim();
      where.OR = [
        { nombre: { contains: termino, mode: 'insensitive' } },
        { sku: { contains: termino, mode: 'insensitive' } },
        { descripcion: { contains: termino, mode: 'insensitive' } },
      ];
    }

    const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const orderBy = { [sortBy]: orderDirection };

    const [articulos, total] = await Promise.all([
      prisma.articulo.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
      }),
      prisma.articulo.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: articulos,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. CREAR NUEVO ARTÍCULO (Modo Administrador)
 * Maneja subida de imagen, cálculo dinámico de PVP y validaciones.
 */
export const crearArticulo = async (req, res, next) => {
  try {
    const {
      sku,
      nombre,
      categoria,
      descripcion,
      costoBase,
      utilidad,
      stock = 0,
      overridePrecio = false,
      precioManual = null,
      estado = 'Disponible',
      imagenUrlDirecta,
    } = req.body;

    if (!sku || !nombre || !categoria || costoBase === undefined || utilidad === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Los campos SKU, Nombre, Categoría, Costo Base y Utilidad son obligatorios.',
      });
    }

    // Validar SKU único
    const existeSku = await prisma.articulo.findUnique({
      where: { sku: sku.trim().toUpperCase() },
    });

    if (existeSku) {
      return res.status(409).json({
        success: false,
        error: `Ya existe un artículo registrado con el SKU "${sku}".`,
      });
    }

    // Validar coherencia numérica
    const validacion = validarParametrosPrecio(costoBase, utilidad);
    if (!validacion.valido) {
      return res.status(400).json({ success: false, error: validacion.error });
    }

    // Procesar imagen subida vía multer o URL directa
    const uploaded = await processUploadedImage(req);
    let finalImageUrl = uploaded?.imagenUrl || imagenUrlDirecta;
    let finalPublicId = uploaded?.imagenPublicId || null;

    if (!finalImageUrl) {
      // Placeholder elegante por defecto si aún no tiene foto
      finalImageUrl = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';
    }

    // Calcular PVP mediante la lógica de negocio
    const isOverride = String(overridePrecio) === 'true' || overridePrecio === true;
    const calculo = calcularPVP(costoBase, utilidad, isOverride, precioManual);

    const stockEntero = Math.max(0, parseInt(stock, 10) || 0);

    // Ajustar estado si el stock inicial es 0 y se había marcado como Disponible
    let estadoFinal = estado;
    if (stockEntero === 0 && estado === 'Disponible') {
      estadoFinal = 'Agotado';
    }

    const nuevoArticulo = await prisma.articulo.create({
      data: {
        sku: sku.trim().toUpperCase(),
        nombre: nombre.trim(),
        categoria,
        descripcion: descripcion ? descripcion.trim() : '',
        costoBase: parseFloat(costoBase),
        utilidad: parseFloat(utilidad),
        pvp: calculo.pvp,
        overridePrecio: calculo.overridePrecio,
        precioManual: calculo.precioManual,
        stock: stockEntero,
        imagenUrl: finalImageUrl,
        imagenPublicId: finalPublicId,
        estado: estadoFinal,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Artículo creado exitosamente.',
      data: nuevoArticulo,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. ACTUALIZAR ARTÍCULO EXISTENTE
 */
export const actualizarArticulo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      sku,
      nombre,
      categoria,
      descripcion,
      costoBase,
      utilidad,
      stock,
      overridePrecio,
      precioManual,
      estado,
      imagenUrlDirecta,
    } = req.body;

    const articuloActual = await prisma.articulo.findUnique({
      where: { id },
    });

    if (!articuloActual) {
      return res.status(404).json({
        success: false,
        error: 'El artículo que intentas editar no existe.',
      });
    }

    // Si se modifica el SKU, verificar que no colisione con otro
    if (sku && sku.trim().toUpperCase() !== articuloActual.sku) {
      const existeSku = await prisma.articulo.findUnique({
        where: { sku: sku.trim().toUpperCase() },
      });
      if (existeSku) {
        return res.status(409).json({
          success: false,
          error: `Ya existe otro artículo registrado con el SKU "${sku}".`,
        });
      }
    }

    // Procesar nueva imagen si fue subida
    const uploaded = await processUploadedImage(req);
    let finalImageUrl = articuloActual.imagenUrl;
    let finalPublicId = articuloActual.imagenPublicId;

    if (uploaded) {
      // Eliminar foto antigua de Storage si existía
      if (articuloActual.imagenPublicId) {
        try {
          await deleteFromStorage(articuloActual.imagenPublicId);
        } catch (storageErr) {
          console.warn('No se pudo eliminar la imagen anterior en Storage:', storageErr.message);
        }
      }
      finalImageUrl = uploaded.imagenUrl;
      finalPublicId = uploaded.imagenPublicId;
    } else if (imagenUrlDirecta) {
      finalImageUrl = imagenUrlDirecta;
    }

    // Determinar valores para recálculo de precios
    const nuevoCosto = costoBase !== undefined ? parseFloat(costoBase) : parseFloat(articuloActual.costoBase);
    const nuevaUtilidad = utilidad !== undefined ? parseFloat(utilidad) : parseFloat(articuloActual.utilidad);
    const nuevoOverride = overridePrecio !== undefined 
      ? (String(overridePrecio) === 'true' || overridePrecio === true) 
      : articuloActual.overridePrecio;
    const nuevoPrecioManual = precioManual !== undefined ? precioManual : articuloActual.precioManual;

    const calculo = calcularPVP(nuevoCosto, nuevaUtilidad, nuevoOverride, nuevoPrecioManual);

    // Determinar nuevo stock y estado
    const nuevoStock = stock !== undefined ? Math.max(0, parseInt(stock, 10)) : articuloActual.stock;
    let nuevoEstado = estado || articuloActual.estado;

    if (nuevoStock === 0 && nuevoEstado === 'Disponible') {
      nuevoEstado = 'Agotado';
    } else if (nuevoStock > 0 && nuevoEstado === 'Agotado') {
      nuevoEstado = 'Disponible';
    }

    const articuloActualizado = await prisma.articulo.update({
      where: { id },
      data: {
        ...(sku && { sku: sku.trim().toUpperCase() }),
        ...(nombre && { nombre: nombre.trim() }),
        ...(categoria && { categoria }),
        ...(descripcion !== undefined && { descripcion: descripcion.trim() }),
        costoBase: nuevoCosto,
        utilidad: nuevaUtilidad,
        pvp: calculo.pvp,
        overridePrecio: calculo.overridePrecio,
        precioManual: calculo.precioManual,
        stock: nuevoStock,
        imagenUrl: finalImageUrl,
        imagenPublicId: finalPublicId,
        estado: nuevoEstado,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Artículo actualizado exitosamente.',
      data: articuloActualizado,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. ELIMINAR ARTÍCULO
 */
export const eliminarArticulo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const articulo = await prisma.articulo.findUnique({
      where: { id },
    });

    if (!articulo) {
      return res.status(404).json({
        success: false,
        error: 'El artículo a eliminar no existe.',
      });
    }

    // Si tiene foto en Storage, limpiarla
    if (articulo.imagenPublicId) {
      try {
        await deleteFromStorage(articulo.imagenPublicId);
      } catch (err) {
        console.warn('No se pudo eliminar la imagen en Storage:', err.message);
      }
    }

    await prisma.articulo.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: `El artículo con SKU ${articulo.sku} ha sido eliminado satisfactoriamente.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. CAMBIO RÁPIDO DE ESTADO (Disponible / Agotado / Oculto)
 */
export const cambiarEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['Disponible', 'Agotado', 'Oculto'].includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido. Opciones permitidas: Disponible, Agotado, Oculto.',
      });
    }

    const articuloActualizado = await prisma.articulo.update({
      where: { id },
      data: { estado },
    });

    return res.status(200).json({
      success: true,
      message: `Estado actualizado a "${estado}".`,
      data: articuloActualizado,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. PREVIEW DE CÁLCULO DE PRECIO EN TIEMPO REAL
 * Utilizado por la UI del panel de administración para ver el PVP dinámico
 */
export const previsualizarCalculoPrecio = async (req, res, next) => {
  try {
    const { costoBase, utilidad, overridePrecio, precioManual } = req.body;

    const calculo = calcularPVP(
      costoBase,
      utilidad,
      String(overridePrecio) === 'true' || overridePrecio === true,
      precioManual
    );

    return res.status(200).json({
      success: true,
      calculo,
    });
  } catch (error) {
    next(error);
  }
};
