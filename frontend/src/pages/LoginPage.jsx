import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onLoginSuccess, onGoToCatalog }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@chesky.com');
  const [password, setPassword] = useState('admin1234');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(res.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xl space-y-6">
        
        {/* Cabecera y Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-900 flex items-center justify-center text-amber-400 shadow-md">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 9l10 13 10-13-10-7zm0 3.3L18.4 9 12 17.3 5.6 9 12 5.3z"/>
            </svg>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Acceso Administrativo
          </h2>
          <p className="text-xs text-stone-500">
            Ingresa para gestionar el inventario, catálogo y rentabilidad
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@chesky.com"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-stone-900 hover:bg-amber-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Validando acceso...</span>
              </>
            ) : (
              <span>Entrar al Panel</span>
            )}
          </button>
        </form>

        {/* Credenciales de Demostración */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
          <span className="font-bold block uppercase text-[10px] tracking-wider text-amber-800">
            Credenciales de Semilla (Demo):
          </span>
          <div><strong>Email:</strong> admin@chesky.com</div>
          <div><strong>Password:</strong> admin1234</div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onGoToCatalog}
            className="text-xs text-stone-500 hover:text-stone-900 font-medium transition-colors"
          >
            ← Volver al Catálogo Público
          </button>
        </div>

      </div>
    </div>
  );
};
