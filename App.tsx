import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, FileBarChart, Menu, X, Wine, Lock, LogOut, Sun, Moon, Settings, Save } from 'lucide-react';
import { AppState, View, Product, Sale } from './types';
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_SUPPLIERS } from './constants';
import Dashboard from './components/Dashboard';
import SalesTerminal from './components/SalesTerminal';
import InventoryManager from './components/InventoryManager';
import ReportsViewer from './components/ReportsViewer';

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessPin, setAccessPin] = useState("1234"); // Estado para la clave
  const [inputPin, setInputPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newPin, setNewPin] = useState('');

  // Theme State
  const [darkMode, setDarkMode] = useState(false);

  // Global State (Mock Backend)
  const [state, setState] = useState<AppState>({
    products: MOCK_PRODUCTS,
    sales: MOCK_SALES,
    suppliers: MOCK_SUPPLIERS,
  });

  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle Theme Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputPin === accessPin) {
      // Login Normal
      setIsAuthenticated(true);
      setLoginError('');
      setInputPin('');
    } else if (inputPin === "0000") {
      // Comando de Restablecimiento
      setIsAuthenticated(true);
      setAccessPin("1234"); // Restablece a clave por defecto
      setLoginError('');
      setInputPin('');
      alert("⚠️ MODO DE RECUPERACIÓN\n\nEl sistema ha sido desbloqueado y la clave se ha restablecido a: 1234");
    } else {
      setLoginError('Clave incorrecta');
      setInputPin('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('DASHBOARD');
    setIsMobileMenuOpen(false);
  };

  const handleChangePin = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPin.length < 4) {
          alert("La clave debe tener al menos 4 dígitos");
          return;
      }
      setAccessPin(newPin);
      setNewPin('');
      setIsSettingsOpen(false);
      alert("✅ Clave actualizada correctamente");
  };

  // Actions
  const handleSaleComplete = (newSale: Sale) => {
    setState(prev => {
      // Update inventory based on sale
      const updatedProducts = prev.products.map(p => {
        const soldItem = newSale.items.find(item => item.id === p.id);
        if (soldItem) {
          return { ...p, stock: p.stock - soldItem.quantity };
        }
        return p;
      });

      // Check for stock alerts
      const critical = updatedProducts.filter(p => p.stock <= p.minStock);
      if (critical.length > prev.products.filter(p => p.stock <= p.minStock).length) {
         console.log("TRIGGER WA NOTIFICATION: Stock Low");
      }

      return {
        ...prev,
        products: updatedProducts,
        sales: [...prev.sales, newSale]
      };
    });
  };

  const handleAddProduct = (p: Product) => {
    setState(prev => ({ ...prev, products: [...prev.products, p] }));
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
     setState(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
     }));
  };

  const handleDeleteProduct = (id: string) => {
      if(window.confirm('¿Seguro que deseas eliminar este producto?')) {
        setState(prev => ({
            ...prev,
            products: prev.products.filter(p => p.id !== id)
        }));
      }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors font-medium ${
        currentView === view
          ? 'bg-brand-600 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 hover:text-brand-700 dark:hover:text-brand-400'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm text-center animate-fade-in border border-gray-200 dark:border-gray-700">
            <div className="absolute top-4 right-4">
                 <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                 >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>
            </div>
          <div className="bg-brand-50 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wine className="w-10 h-10 text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Licorería Don Bacco</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Sistema de Gestión - 404 Studio</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="password" 
                    autoFocus
                    placeholder="Ingrese Clave de Acceso"
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-600 outline-none text-center tracking-widest text-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                />
            </div>
            {loginError && <p className="text-red-500 text-sm font-medium animate-pulse">{loginError}</p>}
            <button 
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 dark:shadow-none"
            >
                Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 z-20">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="bg-brand-600 p-2 rounded-lg text-white">
            <Wine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-800 dark:text-white leading-none">Don Bacco</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">404 Studio</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Inicio" />
          <NavItem view="SALES" icon={ShoppingCart} label="Punto de Venta" />
          <NavItem view="INVENTORY" icon={Package} label="Inventario" />
          <NavItem view="REPORTS" icon={FileBarChart} label="Reportes" />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
            >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {darkMode ? 'Modo Día' : 'Modo Noche'}
            </button>
            <button
                onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
            >
                <Settings className="w-5 h-5" />
                Configuración
            </button>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
            >
                <LogOut className="w-5 h-5" />
                Bloquear
            </button>
            <div className="text-center pt-2">
                <p className="text-xs text-gray-400 dark:text-gray-600">v1.0.1</p>
                <p className="text-[10px] text-gray-300 dark:text-gray-700 mt-0.5">Elaborado por 404Studio</p>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center z-20 sticky top-0">
          <div className="flex items-center gap-2">
             <div className="bg-brand-600 p-1.5 rounded-lg text-white">
                <Wine className="w-5 h-5" />
             </div>
             <span className="font-bold text-lg text-gray-800 dark:text-white">Don Bacco</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white dark:bg-gray-900 z-10 pt-20 px-4 space-y-2 flex flex-col">
            <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Inicio" />
            <NavItem view="SALES" icon={ShoppingCart} label="Punto de Venta" />
            <NavItem view="INVENTORY" icon={Package} label="Inventario" />
            <NavItem view="REPORTS" icon={FileBarChart} label="Reportes" />
            <hr className="my-2 border-gray-100 dark:border-gray-800" />
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
            >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {darkMode ? 'Modo Día' : 'Modo Noche'}
            </button>
             <button
                onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
            >
                <Settings className="w-5 h-5" />
                Configuración
            </button>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
            >
                <LogOut className="w-5 h-5" />
                Bloquear Sistema
            </button>
            <p className="text-center text-xs text-gray-400 mt-auto pb-4">Elaborado por 404Studio</p>
          </div>
        )}

        {/* View Container */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {currentView === 'DASHBOARD' && (
            <Dashboard state={state} changeView={setCurrentView} />
          )}
          
          {currentView === 'SALES' && (
            <SalesTerminal products={state.products} onCompleteSale={handleSaleComplete} />
          )}

          {currentView === 'INVENTORY' && (
            <InventoryManager 
                products={state.products} 
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
            />
          )}

          {currentView === 'REPORTS' && (
            <ReportsViewer sales={state.sales} products={state.products} />
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
             <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Configuración
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleChangePin} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Clave de Acceso</label>
                    <input 
                        required 
                        type="password" 
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white text-center tracking-widest" 
                        value={newPin} 
                        placeholder="****"
                        onChange={e => setNewPin(e.target.value)} 
                    />
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Mínimo 4 caracteres</p>
                </div>
                <button type="submit" className="w-full py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex justify-center items-center gap-2 font-medium">
                    <Save className="w-4 h-4" /> Guardar Nueva Clave
                </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;