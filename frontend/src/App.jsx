import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CatalogPage } from './pages/CatalogPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('catalog');
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-amber-300 font-serif text-xl">
        Cargando CHESKY Joyería...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-grow">
        {currentView === 'catalog' && <CatalogPage />}

        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={() => setCurrentView('admin')}
            onGoToCatalog={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'admin' && (
          isAuthenticated ? (
            <AdminDashboard />
          ) : (
            <LoginPage
              onLoginSuccess={() => setCurrentView('admin')}
              onGoToCatalog={() => setCurrentView('catalog')}
            />
          )
        )}
      </main>

      {/* Footer Elegante */}
      <footer className="bg-stone-900 text-stone-400 py-10 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-lg font-bold text-white tracking-widest">CHESKY</span>
            <span className="text-stone-600">|</span>
            <span className="text-stone-400">Joyería & Bisutería Fina</span>
          </div>

          <div className="text-center sm:text-right text-stone-500">
            © {new Date().getFullYear()} CHESKY. Todos los derechos reservados. Sistema de Inventario y Catálogo Web.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
