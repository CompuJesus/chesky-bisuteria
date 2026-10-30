import React, { useState } from 'react';

export const ProductCard = ({ articulo, config = {} }) => {
  const [copiado, setCopiado] = useState(false);
  const isAgotado = articulo.stock === 0 || articulo.estado === 'Agotado';

  const phone = config.whatsappPhone || '584120000000';
  const plantilla = config.mensajePlantilla || '¡Hola! Me interesa este producto: {nombre} - SKU: {sku} - Precio: ${pvp}';

  const pvpNum = parseFloat(articulo.pvp) || 0;
  const pvpFormateado = pvpNum.toFixed(2);

  // Reemplazar etiquetas dinámicas en el mensaje
  const mensajeWhatsApp = plantilla
    .replace('{nombre}', articulo.nombre)
    .replace('{sku}', articulo.sku)
    .replace('{pvp}', pvpFormateado);

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const enlaceWhatsApp = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensajeWhatsApp)}`;

  // Cálculo en moneda secundaria (Bs.) si está activa
  const tieneMonedaSecundaria = config.monedaSecundariaActiva && config.tasaCambio > 0;
  const precioBs = tieneMonedaSecundaria
    ? (pvpNum * config.tasaCambio).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null;

  const copiarTextoVenta = () => {
    const texto = `💎 *${articulo.nombre}*\n✨ SKU: ${articulo.sku}\n🏷️ Precio: $${pvpFormateado}${precioBs ? ` (${config.monedaSecundariaSimbolo || 'Bs.'} ${precioBs})` : ''}\n📦 Stock: ${articulo.stock > 0 ? `${articulo.stock} disponibles` : 'Agotado'}\n\n📝 ${articulo.descripcion}\n\n📲 Pídelo al WhatsApp: +${cleanPhone}`;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* Contenedor de la Imagen con Lazy Loading */}
      <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
        <img
          src={articulo.imagenUrl}
          alt={articulo.nombre}
          loading="lazy"
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
            isAgotado ? 'grayscale contrast-125 opacity-75' : ''
          }`}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Categoría Pill */}
        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-stone-800 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm border border-stone-200">
          {articulo.categoria}
        </span>

        {/* Botón rápido para copiar publicación de redes */}
        <button
          onClick={copiarTextoVenta}
          title="Copiar texto para WhatsApp / Instagram"
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-stone-900 hover:text-white text-stone-700 shadow-sm transition-all"
        >
          {copiado ? (
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {/* Sello Rojo de Agotado */}
        {isAgotado && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
            <span className="bg-red-600 text-white font-serif font-bold uppercase tracking-widest px-4 py-1.5 text-xs sm:text-sm rounded-full shadow-lg border border-red-400 rotate-[-4deg]">
              Agotado
            </span>
          </div>
        )}

        {/* SKU Badge */}
        <span className="absolute bottom-2 right-2 bg-stone-900/80 backdrop-blur-sm text-stone-200 text-[10px] font-mono px-2 py-0.5 rounded">
          SKU: {articulo.sku}
        </span>
      </div>

      {/* Contenido Informativo */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-semibold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
            {articulo.nombre}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed">
            {articulo.descripcion || 'Pieza exclusiva de bisutería de alta calidad, acabados delicados y diseño contemporáneo.'}
          </p>
        </div>

        {/* Precio y Botón WhatsApp */}
        <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
              Precio PVP
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                ${pvpFormateado}
              </span>
            </div>
            {tieneMonedaSecundaria && (
              <span className="text-[11px] font-semibold text-amber-800">
                ≈ {config.monedaSecundariaSimbolo || 'Bs.'} {precioBs}
              </span>
            )}
          </div>

          {isAgotado ? (
            <button
              disabled
              className="px-3.5 py-2.5 bg-stone-200 text-stone-400 rounded-xl text-xs font-semibold cursor-not-allowed flex items-center space-x-1.5 shadow-none"
            >
              <span>No disponible</span>
            </button>
          ) : (
            <a
              href={enlaceWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center space-x-2 active:scale-95"
            >
              {/* WhatsApp Icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.8 14.13c-.24.67-1.39 1.29-1.93 1.37-.5.08-1.14.12-3.69-.94-3.26-1.35-5.36-4.66-5.52-4.88-.16-.22-1.32-1.75-1.32-3.34 0-1.59.83-2.37 1.13-2.69.29-.32.65-.4 1.86-.4.19 0 .37.01.52.02.43.02.65.11.93.8.35.85 1.2 2.94 1.31 3.15.11.22.18.47.04.74-.14.28-.21.45-.42.7-.21.24-.44.54-.63.73-.21.21-.43.44-.19.85.24.41 1.07 1.76 2.3 2.85 1.58 1.41 2.91 1.85 3.32 2.05.41.21.65.18.89-.1.25-.28 1.06-1.23 1.34-1.65.29-.42.57-.35.97-.2.4.15 2.53 1.19 2.96 1.41.44.22.73.33.84.51.11.19.11 1.07-.13 1.74z"/>
              </svg>
              <span>Comprar</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
