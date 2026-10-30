import React from 'react';

const CATEGORIAS = ['Todas', 'Collares', 'Pulseras', 'Zarcillos', 'Anillos', 'Dijes', 'Sets'];

export const FilterBar = ({ categoriaSeleccionada, setCategoriaSeleccionada, busqueda, setBusqueda }) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Barra de Búsqueda */}
      <div className="relative max-w-xl mx-auto">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar pieza por nombre, SKU o descripción..."
          className="w-full pl-11 pr-10 py-3.5 bg-white rounded-2xl border border-stone-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-sm placeholder-stone-400 outline-none transition-all shadow-sm"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Píldoras de Categorías */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto py-2 px-1 gap-2 no-scrollbar">
        {CATEGORIAS.map((cat) => {
          const isSelected = categoriaSeleccionada === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-stone-900 text-amber-300 shadow-md scale-105'
                  : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
