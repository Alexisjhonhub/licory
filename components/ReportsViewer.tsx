import React from 'react';
import { Sale, Product } from '../types';
import { Share2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsViewerProps {
  sales: Sale[];
  products: Product[];
}

const ReportsViewer: React.FC<ReportsViewerProps> = ({ sales, products }) => {
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalTransactions = sales.length;

  // Calculate most sold products
  const productSalesCount: Record<string, number> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      productSalesCount[item.name] = (productSalesCount[item.name] || 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(productSalesCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.text('Reporte Semanal - Licorería Don Bacco', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Total Ventas: S/ ${totalRevenue.toFixed(2)}`, 14, 30);
    doc.text(`Transacciones: ${totalTransactions}`, 14, 36);
    
    // Top Products Table
    autoTable(doc, {
        startY: 45,
        head: [['Producto', 'Unidades Vendidas']],
        body: topProducts,
    });
    
    // Low Stock Table
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text('Alerta de Stock Bajo', 14, finalY);
    
    autoTable(doc, {
        startY: finalY + 5,
        head: [['Producto', 'Stock Actual', 'Mínimo']],
        body: lowStockProducts.map(p => [p.name, p.stock, p.minStock]),
        theme: 'grid',
        headStyles: { fillColor: [220, 53, 69] }
    });

    doc.save('Reporte_Semanal.pdf');
  };

  const shareViaWhatsApp = () => {
    const message = `*Reporte Licorería Don Bacco*\n\n` +
      `💰 *Ventas Totales:* S/ ${totalRevenue.toFixed(2)}\n` +
      `🧾 *Transacciones:* ${totalTransactions}\n\n` +
      `⚠️ *Stock Crítico:* ${lowStockProducts.length} productos\n` +
      `🏆 *Más Vendido:* ${topProducts[0]?.[0] || 'N/A'}\n\n` +
      `_Generado por 404 Studio_`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Reportes Automáticos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={generatePDFReport} className="flex items-center justify-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full group-hover:bg-red-200 dark:group-hover:bg-red-800 transition">
                <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-left">
                <p className="font-bold text-gray-800 dark:text-white">Descargar PDF</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Resumen semanal detallado</p>
            </div>
        </button>

        <button onClick={shareViaWhatsApp} className="flex items-center justify-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-800 transition">
                <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
             <div className="text-left">
                <p className="font-bold text-gray-800 dark:text-white">Enviar a WhatsApp</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Resumen rápido al administrador</p>
            </div>
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold mb-4 text-gray-800 dark:text-white">Vista Previa (Texto)</h3>
        <div className="font-mono text-sm bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
             <p>VENTAS TOTALES: S/ {totalRevenue.toFixed(2)}</p>
             <p>-------------------------</p>
             <p>TOP PRODUCTOS:</p>
             {topProducts.map(([name, count]) => (
                 <p key={name}>- {name}: {count} un.</p>
             ))}
             <p>-------------------------</p>
             <p>ALERTA STOCK:</p>
             {lowStockProducts.map(p => (
                 <p key={p.id} className="text-red-500 dark:text-red-400">- {p.name} ({p.stock})</p>
             ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsViewer;