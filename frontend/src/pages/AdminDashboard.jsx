import React, { useState, useEffect, useCallback } from 'react';
import {
  getAdminArticles,
  getDashboardMetrics,
  deleteArticle,
  updateArticleStatus,
  quickUpdateStock,
  downloadInventoryCSV,
  getAdminConfig,
  updateAdminConfig,
  changeAdminPassword,
} from '../services/api';
import { MetricsCards } from '../components/MetricsCards';
import { ArticleModal } from '../components/ArticleModal';

const CATEGORIAS = ['Todas', 'Collares', 'Pulseras', 'Zarcillos', 'Anillos', 'Dijes', 'Sets'];
const ESTADOS = ['Todos', 'Disponible', 'Agotado', 'Oculto'];

export const AdminDashboard = () => {
  const [tabActiva, setTabActiva] = useState('inventario'); // 'inventario' | 'publicaciones' | 'reportes' | 'configuracion'
  
  // Datos
  const [articulos, setArticulos] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [config, setConfig] = useState({
    whatsappPhone: '584120000000',
    mensajePlantilla: '¡Hola! Me interesa este producto: {nombre} - SKU: {sku} - Precio: ${pvp}',
    nombreTienda: 'CHESKY Bisutería & Accesorios',
    instagram: '@chesky.joyas',
    monedaSecundariaActiva: false,
    monedaSecundariaSimbolo: 'Bs.',
    tasaCambio: 0,
    umbralBajoStock: 3,
  });

  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [toastVenta, setToastVenta] = useState('');

  // Filtros
  const [categoria, setCategoria] = useState('Todas');
  const [estado, setEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  // Modal CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [articuloAEditar, setArticuloAEditar] = useState(null);

  // Módulo de Publicaciones Rápidas
  const [articuloSeleccionadoPost, setArticuloSeleccionadoPost] = useState(null);
  const [copiadoPost, setCopiadoPost] = useState('');

  // Módulo de Cambio de Contraseña
  const [passData, setPassData] = useState({ passwordActual: '', nuevoPassword: '', confirmarPassword: '' });
  const [passError, setPassError] = useState('');
  const [passExito, setPassExito] = useState('');
  const [cambiandoPass, setCambiandoPass] = useState(false);

  // Simulador de Promociones
  const [descuentoSimulado, setDescuentoSimulado] = useState(10);
  const [categoriaSimulada, setCategoriaSimulada] = useState('Todas');

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
        if (res.data.length > 0 && !articuloSeleccionadoPost) {
          setArticuloSeleccionadoPost(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error cargando inventario admin:', err);
    } finally {
      setLoading(false);
    }
  }, [categoria, estado, busqueda, articuloSeleccionadoPost]);

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

  const cargarConfiguracion = async () => {
    try {
      const res = await getAdminConfig();
      if (res.success && res.config) {
        setConfig(res.config);
      }
    } catch (err) {
      console.error('Error cargando configuración:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    cargarMetricas();
    cargarConfiguracion();
  }, []);

  const handleRecargarTodo = () => {
    cargarDatos();
    cargarMetricas();
    cargarConfiguracion();
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

  const handleAjustarStock = async (art, delta, esVenta = false) => {
    try {
      const res = await quickUpdateStock(art.id, delta);
      if (res.success) {
        setArticulos((prev) =>
          prev.map((item) => (item.id === art.id ? res.data : item))
        );
        if (esVenta) {
          setToastVenta(`🎉 ¡Venta registrada de "${art.nombre}"! Stock restante: ${res.data.stock}`);
          setTimeout(() => setToastVenta(''), 4000);
        }
        cargarMetricas();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo actualizar el stock.');
    }
  };

  const handleGuardarConfiguracion = async (e) => {
    e.preventDefault();
    setGuardandoConfig(true);
    setMensajeExito('');
    try {
      const res = await updateAdminConfig(config);
      if (res.success) {
        setConfig(res.config);
        setMensajeExito('✅ ¡Configuración del negocio guardada exitosamente!');
        setTimeout(() => setMensajeExito(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar la configuración.');
    } finally {
      setGuardandoConfig(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassExito('');

    if (passData.nuevoPassword !== passData.confirmarPassword) {
      setPassError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setCambiandoPass(true);
    try {
      const res = await changeAdminPassword({
        passwordActual: passData.passwordActual,
        nuevoPassword: passData.nuevoPassword,
      });

      if (res.success) {
        setPassExito('✅ Contraseña actualizada de forma segura.');
        setPassData({ passwordActual: '', nuevoPassword: '', confirmarPassword: '' });
      }
    } catch (err) {
      setPassError(err.response?.data?.error || 'Error al actualizar la contraseña.');
    } finally {
      setCambiandoPass(false);
    }
  };

  // Helper para generar copys de redes sociales
  const generarCopy = (art, formato) => {
    if (!art) return '';
    const cleanPhone = (config.whatsappPhone || '584120000000').replace(/[^0-9]/g, '');
    const pvp = parseFloat(art.pvp).toFixed(2);
    const precioBs = config.monedaSecundariaActiva && config.tasaCambio > 0
      ? ` (${config.monedaSecundariaSimbolo || 'Bs.'} ${(parseFloat(art.pvp) * config.tasaCambio).toLocaleString('es-VE', { minimumFractionDigits: 2 })})`
      : '';

    if (formato === 'whatsapp') {
      return `💎 *${art.nombre}*\n✨ SKU: *${art.sku}*\n🏷️ Precio: *$${pvp}*${precioBs}\n📦 Stock disponible: ${art.stock} piezas\n\n📌 *Detalles:* ${art.descripcion || 'Pieza exclusiva de bisutería fina antialérgica y duradera.'}\n\n📲 *Pide el tuyo ahora directo al WhatsApp:* https://wa.me/${cleanPhone}?text=Hola!%20Me%20interesa%20el%20producto%20${encodeURIComponent(art.nombre)}%20(SKU:%20${art.sku})`;
    }

    if (formato === 'instagram') {
      return `✨ NEW ARRIVAL | ${art.nombre} ✨\n\nUna pieza única diseñada para resaltar tu estilo y elegancia en cada ocasión especial. 💫\n\n💎 Referencia: ${art.sku}\n🏷️ Inversión: $${pvp}${precioBs}\n📦 Disponibilidad: ${art.stock > 0 ? 'En Stock para entrega inmediata' : 'Bajo pedido'}\n\n🔍 Materiales: ${art.descripcion || 'Acero inoxidable premium, acabado brillante resistente al agua.'}\n\n📲 Haz tu pedido o consulta al enlace de nuestro perfil o al WhatsApp (+${cleanPhone}).\n\n#BisuteriaFina #Joyería #AccesoriosFemeninos #ModaVenezolana #${art.categoria} #EstiloYModa`;
    }

    return `Hola! 👋 El producto "${art.nombre}" (SKU: ${art.sku}) está disponible por un precio de $${pvp}${precioBs}. Puedes apartarlo escribiéndonos al WhatsApp +${cleanPhone}. ¡Quedan pocas unidades!`;
  };

  const copiarAlPortapapeles = (texto, tipo) => {
    navigator.clipboard.writeText(texto);
    setCopiadoPost(tipo);
    setTimeout(() => setCopiadoPost(''), 2500);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-block p-1 bg-amber-100 rounded-lg text-amber-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </span>
              <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
                Panel Maestro de Administrador
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Control de inventario, cálculo financiero de márgenes, publicaciones automatizadas y ventas.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={downloadInventoryCSV}
              className="px-4 py-2.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center space-x-2"
              title="Descargar inventario para Excel o Auditoría"
            >
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleAbrirCrear}
              className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center space-x-2 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Nueva Pieza</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel Blindado */}
        <div className="flex items-center space-x-2 border-b border-stone-200 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setTabActiva('inventario')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              tabActiva === 'inventario'
                ? 'border-amber-700 text-amber-900 bg-amber-50/80 shadow-sm'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            <span>📦</span>
            <span>Inventario & Stock ({articulos.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('publicaciones')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              tabActiva === 'publicaciones'
                ? 'border-amber-700 text-amber-900 bg-amber-50/80 shadow-sm'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            <span>📱</span>
            <span>Generador de Posts & Redes</span>
          </button>

          <button
            onClick={() => setTabActiva('reportes')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              tabActiva === 'reportes'
                ? 'border-amber-700 text-amber-900 bg-amber-50/80 shadow-sm'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            <span>📊</span>
            <span>Reportes Comerciales & Rentabilidad</span>
          </button>

          <button
            onClick={() => setTabActiva('configuracion')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              tabActiva === 'configuracion'
                ? 'border-amber-700 text-amber-900 bg-amber-50/80 shadow-sm'
                : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            <span>⚙️</span>
            <span>WhatsApp & Negocio</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* PESTAÑA 1: INVENTARIO & STOCK */}
        {/* ============================================================== */}
        {tabActiva === 'inventario' && (
          <div>
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
                        const isBajoStock = art.stock > 0 && art.stock <= (config.umbralBajoStock || 3);
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

                            {/* Stock con Botones de Gestión Rápida */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  type="button"
                                  disabled={art.stock === 0}
                                  onClick={() => handleAjustarStock(art, -1)}
                                  title="Restar 1 pieza"
                                  className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                  -
                                </button>

                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] min-w-[28px] ${
                                    isSinStock
                                      ? 'bg-red-100 text-red-700'
                                      : isBajoStock
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {art.stock}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleAjustarStock(art, +1)}
                                  title="Sumar 1 pieza (reposición)"
                                  className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center transition-all"
                                >
                                  +
                                </button>
                              </div>

                              {/* Botón Rápido VENDIDO */}
                              {art.stock > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleAjustarStock(art, -1, true)}
                                  className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] tracking-wider uppercase shadow-sm transition-all active:scale-95 hover:scale-105"
                                  title="Registrar 1 venta de este producto"
                                >
                                  <span>✓</span>
                                  <span>Vendido</span>
                                </button>
                              ) : (
                                <span className="mt-1 inline-block text-[9px] text-red-500 font-bold uppercase tracking-wider">
                                  Sin stock
                                </span>
                              )}
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
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => {
                                    setArticuloSeleccionadoPost(art);
                                    setTabActiva('publicaciones');
                                  }}
                                  className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Generar post para WhatsApp / Instagram"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                  </svg>
                                </button>

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
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: GENERADOR DE PUBLICACIONES AUTOMÁTICAS (REDES & WHATSAPP) */}
        {/* ============================================================== */}
        {tabActiva === 'publicaciones' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Selector de Producto */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                1. Selecciona el Producto
              </h3>
              <p className="text-xs text-stone-500">
                Elige la pieza que deseas promocionar para generar el contenido publicitario listo.
              </p>

              <div className="max-h-96 overflow-y-auto divide-y divide-stone-100 pr-1">
                {articulos.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setArticuloSeleccionadoPost(art)}
                    className={`p-2.5 rounded-xl flex items-center space-x-3 cursor-pointer transition-all ${
                      articuloSeleccionadoPost?.id === art.id
                        ? 'bg-amber-100/70 border border-amber-300'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    <img
                      src={art.imagenUrl}
                      alt={art.nombre}
                      className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-grow truncate">
                      <span className="font-semibold text-xs text-stone-900 block truncate">{art.nombre}</span>
                      <span className="text-[10px] text-stone-500">SKU: {art.sku} · <strong>${parseFloat(art.pvp).toFixed(2)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generador de Copys Listos */}
            <div className="lg:col-span-2 space-y-4">
              {articuloSeleccionadoPost ? (
                <>
                  <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={articuloSeleccionadoPost.imagenUrl}
                        alt={articuloSeleccionadoPost.nombre}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          {articuloSeleccionadoPost.categoria}
                        </span>
                        <h3 className="font-serif text-base font-bold text-stone-900 mt-0.5">
                          {articuloSeleccionadoPost.nombre}
                        </h3>
                        <span className="text-xs font-semibold text-stone-600">
                          PVP: ${parseFloat(articuloSeleccionadoPost.pvp).toFixed(2)} · Stock: {articuloSeleccionadoPost.stock} unid.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Formato 1: Estado de WhatsApp / Telegram */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                        <span>📲</span>
                        <span>Formato para Estados de WhatsApp / Mensajes Masivos</span>
                      </span>
                      <button
                        onClick={() => copiarAlPortapapeles(generarCopy(articuloSeleccionadoPost, 'whatsapp'), 'whatsapp')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                      >
                        {copiadoPost === 'whatsapp' ? '¡Copiado! ✓' : 'Copiar Texto'}
                      </button>
                    </div>
                    <pre className="p-3.5 bg-stone-50 rounded-xl text-xs font-mono text-stone-700 whitespace-pre-wrap border border-stone-200 leading-relaxed">
                      {generarCopy(articuloSeleccionadoPost, 'whatsapp')}
                    </pre>
                  </div>

                  {/* Formato 2: Instagram / Facebook Post */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-700 uppercase tracking-wider flex items-center space-x-1.5">
                        <span>📸</span>
                        <span>Formato para Pie de Foto de Instagram & Facebook</span>
                      </span>
                      <button
                        onClick={() => copiarAlPortapapeles(generarCopy(articuloSeleccionadoPost, 'instagram'), 'instagram')}
                        className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                      >
                        {copiadoPost === 'instagram' ? '¡Copiado! ✓' : 'Copiar Texto'}
                      </button>
                    </div>
                    <pre className="p-3.5 bg-stone-50 rounded-xl text-xs font-mono text-stone-700 whitespace-pre-wrap border border-stone-200 leading-relaxed">
                      {generarCopy(articuloSeleccionadoPost, 'instagram')}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-stone-400">
                  Selecciona un producto a la izquierda para generar sus publicaciones.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 3: REPORTES COMERCIALES & RENTABILIDAD */}
        {/* ============================================================== */}
        {tabActiva === 'reportes' && (
          <div className="space-y-6">
            
            {/* Resumen Superior */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white p-6 rounded-2xl shadow-md">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-90 block">Rentabilidad Bruta Estimada</span>
                <div className="text-3xl font-serif font-bold mt-1">
                  ${(metricas?.proyeccionGananciaBruta || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-xs opacity-80 mt-1 block">
                  Margen promedio sobre costos: {metricas?.margenGlobalPromedio || 0}%
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-500 block">Total Inversión en Almacén</span>
                <div className="text-3xl font-serif font-bold text-stone-900 mt-1">
                  ${(metricas?.valorTotalInvertido || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-xs text-stone-400 mt-1 block">
                  Costo de adquisición de {metricas?.totalPiezasStock || 0} unidades físicas
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-500 block">Recuperación Total en Venta</span>
                <div className="text-3xl font-serif font-bold text-emerald-700 mt-1">
                  ${(metricas?.valorTotalVentaPVP || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-xs text-stone-400 mt-1 block">
                  Valor bruto al vender todo el stock al PVP actual
                </span>
              </div>
            </div>

            {/* Distribución de Piezas por Categoría */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Distribución de Stock Físico por Categoría
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {metricas?.distribucionCategoria &&
                  Object.entries(metricas.distribucionCategoria).map(([cat, cant]) => (
                    <div key={cat} className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center">
                      <span className="text-xs text-stone-500 font-semibold block uppercase">{cat}</span>
                      <span className="text-2xl font-bold font-serif text-stone-900 mt-1 block">{cant}</span>
                      <span className="text-[10px] text-stone-400">unidades</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Simulador de Promociones y Descuentos */}
            <div className="bg-gradient-to-br from-amber-50/60 to-stone-100 p-6 rounded-2xl border border-amber-200/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center space-x-2">
                    <span>🏷️</span>
                    <span>Simulador de Ofertas y Promociones Especiales</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Calcula cómo impactaría una rebaja en tus ganancias antes de publicar una promoción.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
                    <span className="text-xs font-semibold text-stone-600">Descuento:</span>
                    <select
                      value={descuentoSimulado}
                      onChange={(e) => setDescuentoSimulado(parseInt(e.target.value, 10))}
                      className="text-xs font-bold text-amber-800 outline-none bg-transparent"
                    >
                      <option value={5}>5% OFF</option>
                      <option value={10}>10% OFF</option>
                      <option value={15}>15% OFF</option>
                      <option value={20}>20% OFF</option>
                      <option value={25}>25% OFF</option>
                      <option value={30}>30% OFF</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-stone-200">
                  <span className="text-[11px] uppercase font-semibold text-stone-500 block">Venta con {descuentoSimulado}% OFF</span>
                  <div className="text-xl font-bold text-stone-900 mt-1">
                    ${((metricas?.valorTotalVentaPVP || 0) * (1 - descuentoSimulado / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-stone-400">Total ingresos esperados</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200">
                  <span className="text-[11px] uppercase font-semibold text-stone-500 block">Ganancia Neta Restante</span>
                  <div className="text-xl font-bold text-emerald-700 mt-1">
                    ${(
                      (metricas?.valorTotalVentaPVP || 0) * (1 - descuentoSimulado / 100) -
                      (metricas?.valorTotalInvertido || 0)
                    ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-stone-400">Descontando los costos de compra</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-200">
                  <span className="text-[11px] uppercase font-semibold text-stone-500 block">Margen con Descuento</span>
                  <div className="text-xl font-bold text-amber-800 mt-1">
                    {(
                      (((metricas?.valorTotalVentaPVP || 0) * (1 - descuentoSimulado / 100) -
                        (metricas?.valorTotalInvertido || 0)) /
                        Math.max(1, metricas?.valorTotalInvertido || 1)) *
                      100
                    ).toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-stone-400">Margen neto de retorno</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 4: CONFIGURACIÓN DE WHATSAPP, NEGOCIO & BLINDAJE ADMIN */}
        {/* ============================================================== */}
        {tabActiva === 'configuracion' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Formulario de Configuración de Negocio */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Configuración de Ventas & WhatsApp
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Modifica aquí el número de teléfono donde recibirás los pedidos y los datos de tu marca.
                </p>
              </div>

              {mensajeExito && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold">
                  {mensajeExito}
                </div>
              )}

              <form onSubmit={handleGuardarConfiguracion} className="space-y-5">
                
                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Número de WhatsApp para Pedidos (con código de país) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={config.whatsappPhone}
                      onChange={(e) => setConfig({ ...config, whatsappPhone: e.target.value })}
                      placeholder="Ej: 584121234567"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:bg-white focus:border-amber-600 outline-none"
                    />
                    <span className="absolute left-3.5 top-2.5 text-stone-400">📲</span>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Introduce el código de país sin el signo más. Para Venezuela: <code>58412...</code>, <code>58414...</code>, <code>58424...</code>
                  </span>
                </div>

                {/* Plantilla de Mensaje de WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Plantilla del Mensaje de WhatsApp *
                  </label>
                  <textarea
                    rows="2"
                    required
                    value={config.mensajePlantilla}
                    onChange={(e) => setConfig({ ...config, mensajePlantilla: e.target.value })}
                    placeholder="¡Hola! Me interesa este producto: {nombre} - SKU: {sku} - Precio: ${pvp}"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-600 outline-none leading-relaxed"
                  />
                  <span className="text-[11px] text-stone-400 mt-0.5 block">
                    Variables disponibles: <code>{'{nombre}'}</code>, <code>{'{sku}'}</code>, <code>{'{pvp}'}</code>
                  </span>
                </div>

                {/* Nombre de Tienda e Instagram */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Nombre Comercial de la Tienda
                    </label>
                    <input
                      type="text"
                      value={config.nombreTienda}
                      onChange={(e) => setConfig({ ...config, nombreTienda: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Usuario de Instagram
                    </label>
                    <input
                      type="text"
                      value={config.instagram}
                      onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                      placeholder="@chesky.joyas"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 outline-none"
                    />
                  </div>
                </div>

                {/* Sección Moneda Secundaria (Bolívares / Venezuela) */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                        Conversión de Moneda en Catálogo (Bs. / Venezuela)
                      </span>
                      <span className="text-[11px] text-amber-700">
                        Permite que tus clientes vean el precio aproximado en Bolívares además del PVP en Dólares.
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.monedaSecundariaActiva}
                        onChange={(e) => setConfig({ ...config, monedaSecundariaActiva: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  {config.monedaSecundariaActiva && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                          Tasa de Cambio (1 USD = X Bs.)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={config.tasaCambio}
                          onChange={(e) => setConfig({ ...config, tasaCambio: parseFloat(e.target.value) || 0 })}
                          placeholder="Ej: 50.50"
                          className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-sm font-semibold outline-none focus:border-amber-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                          Símbolo de la Moneda
                        </label>
                        <input
                          type="text"
                          value={config.monedaSecundariaSimbolo}
                          onChange={(e) => setConfig({ ...config, monedaSecundariaSimbolo: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-sm font-semibold outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={guardandoConfig}
                    className="px-6 py-2.5 bg-stone-900 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 flex items-center space-x-2"
                  >
                    {guardandoConfig ? <span>Guardando...</span> : <span>Guardar Configuración</span>}
                  </button>
                </div>
              </form>
            </div>

            {/* Blindaje de Seguridad del Administrador */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-5 h-fit">
              <div>
                <span className="inline-block p-1 bg-red-100 text-red-700 rounded-lg text-xs mb-1">
                  🔒 Seguridad
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Blindaje de Contraseña
                </h3>
                <p className="text-xs text-stone-500">
                  Cambia la contraseña maestra de acceso administrativo en cualquier momento.
                </p>
              </div>

              {passError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                  {passError}
                </div>
              )}

              {passExito && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                  {passExito}
                </div>
              )}

              <form onSubmit={handleCambiarPassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    required
                    value={passData.passwordActual}
                    onChange={(e) => setPassData({ ...passData, passwordActual: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passData.nuevoPassword}
                    onChange={(e) => setPassData({ ...passData, nuevoPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passData.confirmarPassword}
                    onChange={(e) => setPassData({ ...passData, confirmarPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={cambiandoPass}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
                >
                  {cambiandoPass ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* Notificación flotante de Venta Rápida */}
      {toastVenta && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 text-xs sm:text-sm font-semibold flex items-center space-x-2.5 transition-all">
          <span className="p-1 bg-emerald-500 rounded-full text-white text-xs">✓</span>
          <span>{toastVenta}</span>
        </div>
      )}

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
