import React, { useState, useEffect, useCallback } from 'react';
import { getPublicArticles, getPublicConfig } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { FilterBar } from '../components/FilterBar';

export const CatalogPage = () => {
  const [articulos, setArticulos] = useState([]);
  const [config, setConfig] = useState({});
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
      setPagina(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    setPagina(1);
  }, [categoria]);

  // Cargar configuración de negocio pública (WhatsApp, Tasa de cambio, etc.)
  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const res = await getPublicConfig();
        if (res.success && res.config) {
          setConfig(res.config);
        }
      } catch (err) {
        console.warn('Usando configuración por defecto:', err.message);
      }
    };
    cargarConfig();
  }, []);

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

  const cleanPhone = (config.whatsappPhone || '584120000000').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      
      {/* Hero Banner de Bienvenida */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-800 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d7b065_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-500/20 backdrop-blur-sm px-3.5 py-1 rounded-full text-gold-400 text-xs font-semibold tracking-wider uppercase">
            <span>✨</span>
            <span>{config.nombreTienda || 'CHESKY Joyería & Bisutería Fina'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-100">
            Elegancia & Detalle en Bisutería
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
            Piezas elaboradas con acero inoxidable de grado quirúrgico, microcircones y acabados finos en oro 18K. 
            Elige tus piezas favoritas y contáctanos directamente a nuestro WhatsApp oficial para apartar tu pedido.
          </p>

          {/* Barra de Contacto Rápido y Tasa de Cambio */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('¡Hola! Estuve viendo el catálogo en línea y me gustaría consultar disponibilidad.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md transition-all hover:scale-105"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.8 14.13c-.24.67-1.39 1.29-1.93 1.37-.5.08-1.14.12-3.69-.94-3.26-1.35-5.36-4.66-5.52-4.88-.16-.22-1.32-1.75-1.32-3.34 0-1.59.83-2.37 1.13-2.69.29-.32.65-.4 1.86-.4.19 0 .37.01.52.02.43.02.65.11.93.8.35.85 1.2 2.94 1.31 3.15.11.22.18.47.04.74-.14.28-.21.45-.42.7-.21.24-.44.54-.63.73-.21.21-.43.44-.19.85.24.41 1.07 1.76 2.3 2.85 1.58 1.41 2.91 1.85 3.32 2.05.41.21.65.18.89-.1.25-.28 1.06-1.23 1.34-1.65.29-.42.57-.35.97-.2.4.15 2.53 1.19 2.96 1.41.44.22.73.33.84.51.11.19.11 1.07-.13 1.74z"/>
              </svg>
              <span>Atención por WhatsApp</span>
            </a>

            {config.monedaSecundariaActiva && config.tasaCambio > 0 && (
              <span className="inline-flex items-center space-x-1.5 bg-stone-800/80 border border-stone-700 text-stone-300 px-3.5 py-1.5 rounded-full text-xs font-medium">
                <span>Tasa de cambio:</span>
                <strong className="text-amber-400 font-semibold">
                  1 USD = {config.tasaCambio.toLocaleString('es-VE')} {config.monedaSecundariaSimbolo || 'Bs.'}
                </strong>
              </span>
            )}
          </div>
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
              <ProductCard key={art.id} articulo={art} config={config} />
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
