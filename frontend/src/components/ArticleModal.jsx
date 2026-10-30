import React, { useState, useEffect } from 'react';
import { createArticle, updateArticle, previewPriceCalculation } from '../services/api';

const CATEGORIAS = ['Collares', 'Pulseras', 'Zarcillos', 'Anillos', 'Dijes', 'Sets'];
const ESTADOS = ['Disponible', 'Agotado', 'Oculto'];

export const ArticleModal = ({ isOpen, onClose, articuloEditar, onSuccess }) => {
  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    categoria: 'Collares',
    descripcion: '',
    costoBase: '',
    utilidad: '50',
    stock: '1',
    overridePrecio: false,
    precioManual: '',
    estado: 'Disponible',
    imagenUrlDirecta: '',
  });

  const [pvpCalculado, setPvpCalculado] = useState(0);
  const [gananciaUnitaria, setGananciaUnitaria] = useState(0);
  const [margenEfectivo, setMargenEfectivo] = useState(0);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar formulario al abrir o cambiar de artículo a editar
  useEffect(() => {
    if (articuloEditar) {
      setFormData({
        sku: articuloEditar.sku || '',
        nombre: articuloEditar.nombre || '',
        categoria: articuloEditar.categoria || 'Collares',
        descripcion: articuloEditar.descripcion || '',
        costoBase: articuloEditar.costoBase !== undefined ? String(articuloEditar.costoBase) : '',
        utilidad: articuloEditar.utilidad !== undefined ? String(articuloEditar.utilidad) : '50',
        stock: articuloEditar.stock !== undefined ? String(articuloEditar.stock) : '0',
        overridePrecio: Boolean(articuloEditar.overridePrecio),
        precioManual: articuloEditar.precioManual !== null && articuloEditar.precioManual !== undefined ? String(articuloEditar.precioManual) : '',
        estado: articuloEditar.estado || 'Disponible',
        imagenUrlDirecta: articuloEditar.imagenUrl || '',
      });
      setPreviewImage(articuloEditar.imagenUrl || '');
    } else {
      // Estado inicial para nuevo artículo
      setFormData({
        sku: '',
        nombre: '',
        categoria: 'Collares',
        descripcion: '',
        costoBase: '',
        utilidad: '50',
        stock: '1',
        overridePrecio: false,
        precioManual: '',
        estado: 'Disponible',
        imagenUrlDirecta: '',
      });
      setPreviewImage('');
    }
    setSelectedFile(null);
    setErrorMsg('');
  }, [articuloEditar, isOpen]);

  // Recálculo dinámico de PVP en pantalla en tiempo real
  useEffect(() => {
    const costo = parseFloat(formData.costoBase) || 0;
    const util = parseFloat(formData.utilidad) || 0;

    if (formData.overridePrecio && formData.precioManual !== '') {
      const pManual = parseFloat(formData.precioManual) || 0;
      setPvpCalculado(pManual);
      const ganancia = Math.round((pManual - costo) * 100) / 100;
      setGananciaUnitaria(ganancia);
      setMargenEfectivo(costo > 0 ? Math.round((ganancia / costo) * 100) : 0);
    } else {
      // Fórmula estándar requerida: PVP = Costo * (1 + Utilidad / 100)
      const pvp = Math.round(costo * (1 + util / 100) * 100) / 100;
      setPvpCalculado(pvp);
      const ganancia = Math.round((pvp - costo) * 100) / 100;
      setGananciaUnitaria(ganancia);
      setMargenEfectivo(util);
    }
  }, [formData.costoBase, formData.utilidad, formData.overridePrecio, formData.precioManual]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.sku.trim() || !formData.nombre.trim()) {
      setErrorMsg('El SKU y el Nombre del producto son obligatorios.');
      return;
    }

    if (formData.costoBase === '' || isNaN(parseFloat(formData.costoBase))) {
      setErrorMsg('Debes ingresar un costo base válido.');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('sku', formData.sku);
      data.append('nombre', formData.nombre);
      data.append('categoria', formData.categoria);
      data.append('descripcion', formData.descripcion);
      data.append('costoBase', formData.costoBase);
      data.append('utilidad', formData.utilidad);
      data.append('stock', formData.stock);
      data.append('overridePrecio', formData.overridePrecio);
      if (formData.overridePrecio && formData.precioManual !== '') {
        data.append('precioManual', formData.precioManual);
      }
      data.append('estado', formData.estado);

      if (selectedFile) {
        data.append('imagen', selectedFile);
      } else if (formData.imagenUrlDirecta) {
        data.append('imagenUrlDirecta', formData.imagenUrlDirecta);
      }

      if (articuloEditar) {
        await updateArticle(articuloEditar.id, data);
      } else {
        await createArticle(data);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error guardando artículo:', err);
      setErrorMsg(err.response?.data?.error || 'Ocurrió un error al guardar el artículo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {articuloEditar ? 'Editar Artículo' : 'Nuevo Artículo de Bisutería'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Gestiona precios, inventario y catálogo con cálculo automático de márgenes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          
          {/* Fila 1: SKU y Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                SKU / Código *
              </label>
              <input
                type="text"
                name="sku"
                required
                value={formData.sku}
                onChange={handleChange}
                placeholder="Ej: COL-101"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono uppercase focus:bg-white focus:border-amber-600 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Nombre Comercial *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Gargantilla Eslabón Dorado con Perla"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Fila 2: Categoría, Stock y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 outline-none"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Stock Físico *
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                required
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 outline-none"
              >
                {ESTADOS.map((est) => (
                  <option key={est} value={est}>{est}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 3: Descripción */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Descripción / Materiales / Medidas
            </label>
            <textarea
              name="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Detalles de la pieza: Acero inoxidable 316L, baño en oro 18K, medidas, tipo de broche..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 outline-none"
            />
          </div>

          {/* SECCIÓN FINANCIERA: Lógica de Costos y Precios */}
          <div className="p-5 bg-gradient-to-br from-amber-50/60 to-stone-100 rounded-2xl border border-amber-200/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>💰</span> Cálculo de Precios y Rentabilidad
              </span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="overridePrecio"
                  checked={formData.overridePrecio}
                  onChange={handleChange}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-stone-700">Fijar PVP Manualmente (Override)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">
                  Costo Base ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="costoBase"
                  required
                  value={formData.costoBase}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 focus:border-amber-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">
                  Margen Utilidad (%) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="utilidad"
                  disabled={formData.overridePrecio}
                  value={formData.utilidad}
                  onChange={handleChange}
                  placeholder="50"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold outline-none ${
                    formData.overridePrecio ? 'bg-stone-200/60 text-stone-400 border-stone-200' : 'bg-white border-stone-300 text-stone-900 focus:border-amber-600'
                  }`}
                />
              </div>

              {formData.overridePrecio ? (
                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 uppercase mb-1">
                    Precio Manual Cerrado ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="precioManual"
                    value={formData.precioManual}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-400 rounded-xl text-sm font-bold text-amber-900 focus:border-amber-600 outline-none"
                  />
                </div>
              ) : (
                <div className="flex flex-col justify-end">
                  <span className="text-[11px] text-stone-500 mb-1">Fórmula automática:</span>
                  <div className="text-xs text-stone-600 bg-stone-200/60 py-2.5 px-3 rounded-xl font-mono">
                    PVP = Costo * (1 + Util/100)
                  </div>
                </div>
              )}
            </div>

            {/* Resultado del PVP en Tiempo Real */}
            <div className="mt-3 pt-3 border-t border-amber-200/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs uppercase font-semibold text-stone-500">PVP Calculado en Pantalla:</span>
                <span className="text-2xl font-serif font-bold text-stone-900 bg-white px-3 py-1 rounded-xl shadow-sm border border-stone-200">
                  ${pvpCalculado.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs font-medium text-stone-600">
                <span>Ganancia Unitaria: <strong className="text-emerald-700 font-bold">+${gananciaUnitaria.toFixed(2)}</strong></span>
                <span>Margen Efectivo: <strong className="text-amber-800 font-bold">{margenEfectivo}%</strong></span>
              </div>
            </div>
          </div>

          {/* SECCIÓN DE IMAGEN */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Fotografía de la Pieza (Cloudinary / Nube)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-2 space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-amber-800 transition-all cursor-pointer"
                />
                <div className="text-[11px] text-stone-400">
                  O pega una URL directa de imagen si no subes un archivo local:
                </div>
                <input
                  type="url"
                  name="imagenUrlDirecta"
                  value={formData.imagenUrlDirecta}
                  onChange={(e) => {
                    handleChange(e);
                    if (!selectedFile) setPreviewImage(e.target.value);
                  }}
                  placeholder="https://ejemplo.com/foto-joya.jpg"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white outline-none"
                />
              </div>

              {/* Preview Miniatura */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-stone-400 text-center px-2">Sin imagen seleccionada</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-amber-800 text-white text-sm font-semibold transition-all shadow-md flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{articuloEditar ? 'Actualizar Artículo' : 'Guardar Artículo'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
