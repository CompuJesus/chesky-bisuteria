import React, { useState, useEffect, useCallback } from 'react';
import {
  getAdminArticles,
  getDashboardMetrics,
  deleteArticle,
  updateArticleStatus,
  downloadInventoryCSV,
} from '../services/api';
import { MetricsCards } from '../components/MetricsCards';
import { ArticleModal } from '../components/ArticleModal';

const CATEGORIAS = ['Todas', 'Collares', 'Pulseras', 'Zarcillos', 'Anillos', 'Dijes', 'Sets'];
const ESTADOS = ['Todos', 'Disponible', 'Agotado', 'Oculto'];

export const AdminDashboard = () => {
  const [articulos, setArticulos] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Filtros
  const [categoria, setCategoria] = useState('Todas');
  const [estado, setEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  // Modal CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [articuloAEditar, setArticuloAEditar] = useState(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminArticles({
        categoria: categoria !== 'Todas' ? categoria : undefined,
        estado: estado !== 'Todos' ? estado : undefined,
        q: busqueda.trim() || undefined,
        limit: 100,
      });

      if (res.success) {
        setArticulos(res.data);
      }
    } catch (err) {
      console.error('Error cargando inventario admin:', err);
    } finally {
      setLoading(false);
    }
  }, [categoria, estado, busqueda]);

  const cargarMetricas = async () => {
    setMetricsLoading(true);
    try {
      const res = await getDashboardMetrics();
      if (res.success) {
        setMetricas(res.metricas);
      }
    } catch (err) {
      console.error('Error cargando métricas:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    cargarMetricas();
  }, []);

  const handleRecargarTodo = () => {
    cargarDatos();
    cargarMetricas();
  };

  const handleAbrirCrear = () => {
    setArticuloAEditar(null);
    setModalOpen(true);
  };

  const handleAbrirEditar = (art) => {
    setArticuloAEditar(art);
    setModalOpen(true);
  };

  const handleEliminar = async (id, sku) => {
    if (!window.confirm(`¿Estás seguro de eliminar el artículo con SKU: ${sku}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteArticle(id);
      handleRecargarTodo();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar el artículo.');
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateArticleStatus(id, nuevoEstado);
      cargarDatos();
    } catch (err) {
      alert('No se pudo actualizar el estado.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Encabezado del Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
              Panel de Control e Inventario
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Supervisión de stock, márgenes de utilidad, cálculo de precios y exportaciones contables.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Botón Exportar CSV */}
            <button
              onClick={downloadInventoryCSV}
              className="px-4 py-2.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center space-x-2"
              title="Descargar inventario para Excel o Auditoría"
            >
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar CSV / Excel</span>
            </button>

            {/* Botón Nuevo Artículo */}
            <button
              onClick={handleAbrirCrear}
              className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center space-x-2 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Agregar Artículo</span>
            </button>
          </div>
        </div>

        {/* Bloque de Métricas Rápidas */}
        <MetricsCards metricas={metricas} loading={metricsLoading} />

        {/* Barra de Filtros de la Tabla */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por SKU, Nombre..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-600 outline-none"
            />
            <svg className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-stone-500 font-medium">Categoría:</span>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 outline-none focus:border-amber-600"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-stone-500 font-medium">Estado:</span>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 outline-none focus:border-amber-600"
              >
                {ESTADOS.map((est) => (
                  <option key={est} value={est}>{est}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRecargarTodo}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
              title="Refrescar datos"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabla de Artículos */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Pieza</th>
                  <th className="py-3.5 px-3">SKU</th>
                  <th className="py-3.5 px-3">Categoría</th>
                  <th className="py-3.5 px-3 text-right">Costo Base</th>
                  <th className="py-3.5 px-3 text-right">Utilidad</th>
                  <th className="py-3.5 px-3 text-right">PVP</th>
                  <th className="py-3.5 px-3 text-center">Stock</th>
                  <th className="py-3.5 px-3 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-stone-400">
                      Cargando registros del inventario...
                    </td>
                  </tr>
                ) : articulos.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-stone-400">
                      No se encontraron artículos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  articulos.map((art) => {
                    const costo = parseFloat(art.costoBase);
                    const util = parseFloat(art.utilidad);
                    const pvp = parseFloat(art.pvp);
                    const isBajoStock = art.stock > 0 && art.stock <= 3;
                    const isSinStock = art.stock === 0;

                    return (
                      <tr key={art.id} className="hover:bg-amber-50/30 transition-colors">
                        
                        {/* Pieza & Imagen */}
                        <td className="py-3 px-4 flex items-center space-x-3">
                          <img
                            src={art.imagenUrl}
                            alt={art.nombre}
                            className="w-10 h-10 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                          <div className="max-w-[180px] sm:max-w-xs truncate">
                            <span className="font-semibold text-stone-900 block truncate">{art.nombre}</span>
                            <span className="text-[10px] text-stone-400 truncate block">{art.descripcion || 'Sin descripción'}</span>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-3 font-mono font-bold text-stone-700">
                          {art.sku}
                        </td>

                        {/* Categoría */}
                        <td className="py-3 px-3">
                          <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                            {art.categoria}
                          </span>
                        </td>

                        {/* Costo */}
                        <td className="py-3 px-3 text-right font-medium text-stone-600">
                          ${costo.toFixed(2)}
                        </td>

                        {/* Utilidad */}
                        <td className="py-3 px-3 text-right">
                          <span className="font-semibold text-emerald-700">
                            {util.toFixed(0)}%
                          </span>
                          {art.overridePrecio && (
                            <span className="block text-[9px] text-amber-700 font-bold uppercase">Manual</span>
                          )}
                        </td>

                        {/* PVP */}
                        <td className="py-3 px-3 text-right font-bold text-stone-900 text-sm">
                          ${pvp.toFixed(2)}
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              isSinStock
                                ? 'bg-red-100 text-red-700'
                                : isBajoStock
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {art.stock}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="py-3 px-3 text-center">
                          <select
                            value={art.estado}
                            onChange={(e) => handleCambiarEstado(art.id, e.target.value)}
                            className={`text-[10px] font-semibold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                              art.estado === 'Disponible'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : art.estado === 'Agotado'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-stone-100 text-stone-600 border-stone-300'
                            }`}
                          >
                            <option value="Disponible">Disponible</option>
                            <option value="Agotado">Agotado</option>
                            <option value="Oculto">Oculto</option>
                          </select>
                        </td>

                        {/* Acciones */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleAbrirEditar(art)}
                              className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Editar artículo"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleEliminar(art.id, art.sku)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar artículo"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal para Crear y Editar Artículo */}
      <ArticleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        articuloEditar={articuloAEditar}
        onSuccess={handleRecargarTodo}
      />
    </div>
  );
};
