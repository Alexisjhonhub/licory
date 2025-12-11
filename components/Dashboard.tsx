import React from 'react';
import { AppState, View } from '../types';
import { AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardProps {
  state: AppState;
  changeView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, changeView }) => {
  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const salesToday = state.sales.filter(s => s.date.startsWith(today));
  const totalSalesToday = salesToday.reduce((acc, s) => acc + s.total, 0);
  
  const lowStockCount = state.products.filter(p => p.stock <= p.minStock).length;
  
  // Chart Data Preparation
  const getLast7DaysSales = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const daySales = state.sales
        .filter(s => s.date.startsWith(dateStr))
        .reduce((acc, s) => acc + s.total, 0);
      data.push({ name: d.toLocaleDateString('es-PE', { weekday: 'short' }), total: daySales });
    }
    return data;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Panel Principal</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:shadow-md transition" onClick={() => changeView('SALES')}>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Ventas Hoy</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">S/ {totalSalesToday.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:shadow-md transition" onClick={() => changeView('INVENTORY')}>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Stock Crítico</p>
            <p className={`text-3xl font-bold ${lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>{lowStockCount}</p>
          </div>
          <div className={`${lowStockCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'} p-3 rounded-full`}>
            <AlertTriangle className={`w-8 h-8 ${lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Productos</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{state.products.length}</p>
            </div>
             <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ventas de la Semana
        </h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getLast7DaysSales()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `S/ ${value}`} tick={{fill: '#9CA3AF'}} />
                    <Tooltip 
                        formatter={(value) => [`S/ ${value}`, 'Ventas']}
                        contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#1f2937',
                            color: '#fff'
                        }}
                    />
                    <Bar dataKey="total" fill="#7e22ce" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions for Mobile */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        <button 
            onClick={() => changeView('SALES')}
            className="bg-brand-600 text-white p-4 rounded-xl shadow-md font-bold text-lg active:scale-95 transition"
        >
            Nueva Venta
        </button>
        <button 
            onClick={() => changeView('INVENTORY')}
            className="bg-gray-800 dark:bg-gray-700 text-white p-4 rounded-xl shadow-md font-bold text-lg active:scale-95 transition"
        >
            Inventario
        </button>
      </div>
    </div>
  );
};

export default Dashboard;