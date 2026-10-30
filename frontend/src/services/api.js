import axios from 'axios';

// En producción usa la URL del backend en Render, en desarrollo usa el proxy local de Vite
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token JWT automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chesky_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para capturar expiración de sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config.url.includes('/auth/login');
      if (!isAuthRoute) {
        localStorage.removeItem('chesky_token');
        localStorage.removeItem('chesky_user');
      }
    }
    return Promise.reject(error);
  }
);

// --- Servicios Públicos (Catálogo Modo Cliente) ---
export const getPublicArticles = async (params = {}) => {
  const { data } = await api.get('/articulos/publico', { params });
  return data;
};

export const getPublicArticleById = async (id) => {
  const { data } = await api.get(`/articulos/publico/${id}`);
  return data;
};

// --- Servicios de Autenticación ---
export const loginUser = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const getAuthProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

// --- Servicios Privados (Modo Administrador) ---
export const getAdminArticles = async (params = {}) => {
  const { data } = await api.get('/articulos', { params });
  return data;
};

export const createArticle = async (formData) => {
  const { data } = await api.post('/articulos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateArticle = async (id, formData) => {
  const { data } = await api.put(`/articulos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteArticle = async (id) => {
  const { data } = await api.delete(`/articulos/${id}`);
  return data;
};

export const updateArticleStatus = async (id, estado) => {
  const { data } = await api.patch(`/articulos/${id}/estado`, { estado });
  return data;
};

export const previewPriceCalculation = async (payload) => {
  const { data } = await api.post('/articulos/calcular-precio', payload);
  return data;
};

export const getDashboardMetrics = async () => {
  const { data } = await api.get('/metricas');
  return data;
};

export const downloadInventoryCSV = () => {
  const token = localStorage.getItem('chesky_token');
  const csvUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/exportar/csv`
    : '/api/exportar/csv';
  fetch(csvUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error('Error al generar archivo CSV');
      return res.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fecha = new Date().toISOString().split('T')[0];
      a.download = `inventario_chesky_${fecha}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch((err) => {
      console.error('Error al exportar inventario:', err);
      alert('No se pudo descargar el archivo CSV. Verifica tus permisos.');
    });
};

export default api;
