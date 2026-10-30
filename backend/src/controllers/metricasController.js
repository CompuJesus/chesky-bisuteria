import prisma from '../utils/prisma.js';
import { redondearDosDecimales } from '../services/pricingService.js';

export const obtenerMetricasDashboard = async (req, res, next) => {
  try {
    const articulos = await prisma.articulo.findMany({
      select: {
        id: true,
        sku: true,
        nombre: true,
        categoria: true,
        costoBase: true,
        pvp: true,
        stock: true,
        estado: true,
      },
    });

    let totalPiezasStock = 0;       // Suma de unidades físicas
    let totalArticulosUnicos = 0;   // Cantidad de referencias/SKUs
    let valorTotalInvertido = 0;    // Suma de (CostoBase * Stock)
    let valorTotalVentaPVP = 0;     // Suma de (PVP * Stock)
    let articulosAgotados = 0;
    let articulosBajoStock = 0;     // Stock entre 1 y 3 unidades

    const porCategoria = {
      Collares: 0,
      Pulseras: 0,
      Zarcillos: 0,
      Anillos: 0,
      Dijes: 0,
      Sets: 0,
    };

    articulos.forEach((art) => {
      totalArticulosUnicos += 1;
      const stock = art.stock || 0;
      const costo = parseFloat(art.costoBase) || 0;
      const pvp = parseFloat(art.pvp) || 0;

      totalPiezasStock += stock;
      valorTotalInvertido += costo * stock;
      valorTotalVentaPVP += pvp * stock;

      if (stock === 0 || art.estado === 'Agotado') {
        articulosAgotados += 1;
      } else if (stock <= 3) {
        articulosBajoStock += 1;
      }

      if (porCategoria[art.categoria] !== undefined) {
        porCategoria[art.categoria] += stock;
      }
    });

    const proyeccionGananciaBruta = redondearDosDecimales(valorTotalVentaPVP - valorTotalInvertido);
    const margenGlobalPromedio = valorTotalInvertido > 0
      ? redondearDosDecimales((proyeccionGananciaBruta / valorTotalInvertido) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      metricas: {
        totalArticulosUnicos,
        totalPiezasStock,
        valorTotalInvertido: redondearDosDecimales(valorTotalInvertido),
        valorTotalVentaPVP: redondearDosDecimales(valorTotalVentaPVP),
        proyeccionGananciaBruta,
        margenGlobalPromedio,
        articulosAgotados,
        articulosBajoStock,
        distribucionCategoria: porCategoria,
      },
    });
  } catch (error) {
    next(error);
  }
};
