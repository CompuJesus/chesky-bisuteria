import React, { useState, useEffect, useCallback } from 'react';
import { getPublicArticles } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { FilterBar } from '../components/FilterBar';

export const CatalogPage = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [paginacion, setPaginacion] = useState({ total: 0, totalPages: 1 });

  // Debounce para búsqueda en tiempo real
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busqueda);
      setPagina(1); // Reiniciar a la página 1 cuando cambia la búsqueda
    }, 350);

    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    setPagina(1); // Reiniciar a página 1 al cambiar de categoría
  }, [categoria]);

  const cargarArticulos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPublicArticles({
        categoria: categoria !== 'Todas' ? categoria : undefined,
        q: debouncedBusqueda || undefined,
        page: pagina,
        limit: 12,
      });

      if (res.success) {
        setArticulos(res.data);
        setPaginacion(res.pagination);
      }
    } catch (err) {
      console.error('Error al cargar artículos:', err);
    } finally {
      setLoading(false);
    }
  }, [categoria, debouncedBusqueda, pagina]);

  useEffect(() => {
    cargarArticulos();
  }, [cargarArticulos]);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      
      {/* Hero Banner de Bienvenida */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-800 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d7b065_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-block text-gold-400 font-semibold tracking-widest text-xs uppercase px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 backdrop-blur-sm">
            Nueva Colección 2026
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-100">
            Elegancia & Detalle en Bisutería
          </h1>
          <p className="max-w-2xl mx-auto text-stone-300 text-sm sm:text-base font-light leading-relaxed">
            Piezas elaboradas con acero inoxidable de grado quirúrgico, microcircones y acabados en oro 18K. 
            Elige tus favoritas y contáctanos al instante por WhatsApp para apartar tu pedido.
          </p>
        </div>
      </section>

      {/* Contenedor Principal del Catálogo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Barra de Filtros y Búsqueda */}
        <FilterBar
          categoriaSeleccionada={categoria}
          setCategoriaSeleccionada={setCategoria}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
        />

        {/* Resumen de Resultados */}
        <div className="flex items-center justify-between mb-6 text-xs text-stone-500 font-medium">
          <span>
            Mostrando <strong>{articulos.length}</strong> de <strong>{paginacion.total}</strong> artículos
          </span>
          {categoria !== 'Todas' && (
            <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-semibold">
              Filtrado por: {categoria}
            </span>
          )}
        </div>

        {/* Grid / Mosaico de Productos */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-3 h-80"
              >
                <div className="bg-stone-200 rounded-xl aspect-square w-full" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
                <div className="h-6 bg-stone-200 rounded w-1/3 mt-2" />
              </div>
            ))}
          </div>
        ) : articulos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 max-w-md mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-800">No encontramos resultados</h3>
            <p className="text-xs text-stone-500 mt-2">
              Prueba buscando con otro término o seleccionando otra categoría.
            </p>
            <button
              onClick={() => {
                setBusqueda('');
                setCategoria('Todas');
              }}
              className="mt-5 px-4 py-2 bg-stone-900 text-white rounded-full text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {articulos.map((art) => (
              <ProductCard key={art.id} articulo={art} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {paginacion.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center space-x-2">
            <button
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Anterior
            </button>
            <span className="text-xs sm:text-sm text-stone-600 font-medium px-3">
              Página {pagina} de {paginacion.totalPages}
            </span>
            <button
              disabled={pagina >= paginacion.totalPages}
              onClick={() => setPagina((p) => Math.min(paginacion.totalPages, p + 1))}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
