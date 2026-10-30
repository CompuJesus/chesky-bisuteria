import prisma from '../utils/prisma.js';
import { stringify } from 'csv-stringify';

export const exportarInventarioCSV = async (req, res, next) => {
  try {
    const articulos = await prisma.articulo.findMany({
      orderBy: [
        { categoria: 'asc' },
        { nombre: 'asc' },
      ],
    });

    const dataCSV = articulos.map((art) => {
      const stock = art.stock || 0;
      const costo = parseFloat(art.costoBase) || 0;
      const pvp = parseFloat(art.pvp) || 0;
      const valorCostoTotal = Math.round(costo * stock * 100) / 100;
      const valorVentaTotal = Math.round(pvp * stock * 100) / 100;
      const gananciaTotal = Math.round((valorVentaTotal - valorCostoTotal) * 100) / 100;

      return [
        art.sku,
        art.nombre,
        art.categoria,
        art.descripcion ? art.descripcion.replace(/(\r\n|\n|\r)/gm, ' ') : '',
        stock,
        costo.toFixed(2),
        `${parseFloat(art.utilidad).toFixed(2)}%`,
        pvp.toFixed(2),
        art.overridePrecio ? 'SÍ' : 'NO',
        valorCostoTotal.toFixed(2),
        valorVentaTotal.toFixed(2),
        gananciaTotal.toFixed(2),
        art.estado,
        art.imagenUrl,
        new Date(art.fechaActualizacion).toISOString().split('T')[0],
      ];
    });

    const columnas = [
      'SKU',
      'Nombre del Producto',
      'Categoría',
      'Descripción / Materiales',
      'Stock Físico',
      'Costo Base ($)',
      'Margen Utilidad (%)',
      'PVP Unitario ($)',
      'Precio Manual (Override)',
      'Inversión Total Stock ($)',
      'Venta Proyectada Total ($)',
      'Ganancia Bruta Proyectada ($)',
      'Estado',
      'Enlace Imagen',
      'Fecha Última Modificación',
    ];

    const fechaHoy = new Date().toISOString().split('T')[0];
    const nombreArchivo = `inventario_chesky_bisuteria_${fechaHoy}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

    // BOM UTF-8 para garantizar que Microsoft Excel abra los acentos correctamente
    res.write('\ufeff');

    const stringifier = stringify({
      header: true,
      columns: columnas,
      delimiter: ';', // Delimitador estándar compatible con Excel hispanohablante
    });

    stringifier.pipe(res);

    dataCSV.forEach((fila) => {
      stringifier.write(fila);
    });

    stringifier.end();
  } catch (error) {
    next(error);
  }
};
