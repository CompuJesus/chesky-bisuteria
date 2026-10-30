import React from 'react';

export const MetricsCards = ({ metricas, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-stone-200 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const items = [
    {
      titulo: 'Total Piezas en Sistema',
      valor: `${metricas?.totalPiezasStock || 0} unid.`,
      subtexto: `${metricas?.totalArticulosUnicos || 0} modelos / SKUs`,
      icono: (
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgIcon: 'bg-amber-50',
    },
    {
      titulo: 'Inventario Invertido (Costo)',
      valor: `$${(metricas?.valorTotalInvertido || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtexto: 'Costo total de adquisición',
      icono: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgIcon: 'bg-blue-50',
    },
    {
      titulo: 'Ganancia Bruta Proyectada',
      valor: `$${(metricas?.proyeccionGananciaBruta || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtexto: `Margen medio est.: ${metricas?.margenGlobalPromedio || 0}%`,
      icono: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      bgIcon: 'bg-emerald-50',
    },
    {
      titulo: 'Valor de Venta Total (PVP)',
      valor: `$${(metricas?.valorTotalVentaPVP || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtexto: `${metricas?.articulosAgotados || 0} agotados · ${metricas?.articulosBajoStock || 0} bajo stock`,
      icono: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgIcon: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((it, idx) => (
        <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              {it.titulo}
            </span>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
              {it.valor}
            </div>
            <span className="text-xs text-stone-400 mt-1 block">
              {it.subtexto}
            </span>
          </div>
          <div className={`p-3 rounded-xl ${it.bgIcon} flex-shrink-0`}>
            {it.icono}
          </div>
        </div>
      ))}
    </div>
  );
};
