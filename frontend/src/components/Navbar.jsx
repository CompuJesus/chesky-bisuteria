import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo y Marca */}
          <div 
            onClick={() => setCurrentView('catalog')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-gold-400 to-amber-200 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 9l10 13 10-13-10-7zm0 3.3L18.4 9 12 17.3 5.6 9 12 5.3z"/>
              </svg>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-wider text-stone-900 group-hover:text-amber-800 transition-colors">
                CHESKY
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-stone-500 font-medium -mt-1">
                Bisutería & Accesorios
              </span>
            </div>
          </div>

          {/* Navegación y Switch de Vistas */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setCurrentView('catalog')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                currentView === 'catalog'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Catálogo Público
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    currentView === 'admin'
                      ? 'bg-amber-700 text-white shadow-sm'
                      : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Panel Admin</span>
                </button>

                <div className="hidden md:flex flex-col text-right pl-2 border-l border-stone-200">
                  <span className="text-xs font-semibold text-stone-800">{user?.nombre || 'Admin'}</span>
                  <span className="text-[10px] text-stone-500 uppercase">{user?.rol || 'ADMIN'}</span>
                </div>

                <button
                  onClick={logout}
                  title="Cerrar Sesión"
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  currentView === 'login'
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Acceso Admin</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
