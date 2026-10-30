/**
 * Servicio de Lógica de Negocio para el Cálculo de Precios, Costos y Utilidades.
 * Bisutería - Sistema de Inventario CHESKY
 */

/**
 * Redondea un valor numérico a dos decimales de forma precisa.
 * @param {number|string} valor 
 * @returns {number}
 */
export const redondearDosDecimales = (valor) => {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Calcula el Precio de Venta al Público (PVP) dinámicamente o aplica override manual.
 * 
 * Regla de negocio:
 * PVP = Costo * (1 + Utilidad / 100)
 * 
 * @param {number|string} costoBase - Costo de adquisición o materiales
 * @param {number|string} utilidad - Porcentaje de margen de ganancia (ej. 30 para 30%)
 * @param {boolean} overridePrecio - Bandera para indicar si se fuerza un precio manual
 * @param {number|string|null} precioManual - Precio manual cerrado si overridePrecio es true
 * @returns {{ pvp: number, overridePrecio: boolean, precioManual: number|null, gananciaUnitaria: number, margenEfectivo: number }}
 */
export const calcularPVP = (
  costoBase,
  utilidad,
  overridePrecio = false,
  precioManual = null
) => {
  const costo = Math.max(0, redondearDosDecimales(costoBase));
  const util = Math.max(0, redondearDosDecimales(utilidad));
  const isOverride = Boolean(overridePrecio);

  let pvpCalculado = 0;
  let pManual = null;

  if (isOverride && precioManual !== null && precioManual !== undefined && precioManual !== '') {
    const manualNum = redondearDosDecimales(precioManual);
    if (manualNum >= 0) {
      pvpCalculado = manualNum;
      pManual = manualNum;
    } else {
      pvpCalculado = redondearDosDecimales(costo * (1 + util / 100));
    }
  } else {
    // Cálculo dinámico estándar: PVP = Costo * (1 + Utilidad / 100)
    pvpCalculado = redondearDosDecimales(costo * (1 + util / 100));
  }

  // Métricas financieras unitarias
  const gananciaUnitaria = redondearDosDecimales(pvpCalculado - costo);
  const margenEfectivo = costo > 0
    ? redondearDosDecimales((gananciaUnitaria / costo) * 100)
    : 0;

  return {
    pvp: pvpCalculado,
    overridePrecio: isOverride,
    precioManual: pManual,
    gananciaUnitaria,
    margenEfectivo,
  };
};

/**
 * Valida que los datos numéricos de costo y utilidad sean coherentes.
 * @param {any} costoBase 
 * @param {any} utilidad 
 * @returns {{ valido: boolean, error?: string }}
 */
export const validarParametrosPrecio = (costoBase, utilidad) => {
  const costo = parseFloat(costoBase);
  const util = parseFloat(utilidad);

  if (isNaN(costo) || costo < 0) {
    return { valido: false, error: 'El costo base debe ser un número mayor o igual a 0.' };
  }

  if (isNaN(util) || util < 0) {
    return { valido: false, error: 'El porcentaje de utilidad debe ser un número mayor o igual a 0.' };
  }

  return { valido: true };
};
