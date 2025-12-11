import React from 'react';
import { Sale, Product } from '../types';
import { Share2, FileText, Download } from 'lucide-react';
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
  const avgTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

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
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    const today = new Date().toLocaleDateString('es-PE');

    // --- Header ---
    doc.setFillColor(126, 34, 206); // Brand Purple
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('REPORTE GERENCIAL', margin, 17);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Licorería Don Bacco | Fecha: ${today}`, pageWidth - margin, 17, { align: 'right' });

    // --- Resumen Ejecutivo (Cards) ---
    const startY = 35;
    const cardWidth = (pageWidth - (margin * 2) - 10) / 3;
    const cardHeight = 25;

    // Card 1: Revenue
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, startY, cardWidth, cardHeight, 3, 3, 'FD');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text('Ingresos Totales', margin + 5, startY + 8);
    doc.setTextColor(30, 150, 50); // Green
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`S/ ${totalRevenue.toFixed(2)}`, margin + 5, startY + 18);

    // Card 2: Transactions
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin + cardWidth + 5, startY, cardWidth, cardHeight, 3, 3, 'FD');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('N° Transacciones', margin + cardWidth + 10, startY + 8);
    doc.setTextColor(75, 85, 99); // Gray
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${totalTransactions}`, margin + cardWidth + 10, startY + 18);

    // Card 3: Avg Ticket
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin + (cardWidth * 2) + 10, startY, cardWidth, cardHeight, 3, 3, 'FD');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Ticket Promedio', margin + (cardWidth * 2) + 15, startY + 8);
    doc.setTextColor(59, 130, 246); // Blue
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`S/ ${avgTicket.toFixed(2)}`, margin + (cardWidth * 2) + 15, startY + 18);

    // --- Table 1: Top Products ---
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Productos Más Vendidos', margin, startY + 35);

    autoTable(doc, {
        startY: startY + 40,
        head: [['Producto', 'Unidades Vendidas', '% Total']],
        body: topProducts.map(([name, count]) => [
            name, 
            count,
            // Calculate pseudo percentage for demo
             `${Math.round((count / (sales.reduce((a,b) => a + b.items.reduce((x,y) => x + y.quantity, 0), 0) || 1)) * 100)}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [126, 34, 206] } // Brand Purple
    });

    // --- Table 2: Low Stock Alert ---
    // @ts-ignore
    let currentY = doc.lastAutoTable.finalY + 15;
    
    if (lowStockProducts.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(185, 28, 28); // Red
        doc.text(`Alerta de Stock Bajo (${lowStockProducts.length})`, margin, currentY);
        
        autoTable(doc, {
            startY: currentY + 5,
            head: [['Producto', 'Stock Actual', 'Stock Mínimo', 'Estado']],
            body: lowStockProducts.map(p => [p.name, p.stock, p.minStock, 'CRÍTICO']),
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38] },
            styles: { fontSize: 9 }
        });
        // @ts-ignore
        currentY = doc.lastAutoTable.finalY + 15;
    } else {
        currentY += 10; // Space if no table
    }

    // --- Table 3: Detailed Transactions Log (New Feature) ---
    doc.addPage(); // New page for the detailed log
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Detalle de Transacciones (Historial)', margin, 20);

    const detailedSalesData = sales.map(s => [
        s.id,
        new Date(s.date).toLocaleString('es-PE'),
        s.paymentMethod,
        s.items.length,
        `S/ ${s.total.toFixed(2)}`
    ]).reverse(); // Show newest first

    autoTable(doc, {
        startY: 25,
        head: [['ID Ticket', 'Fecha/Hora', 'Método Pago', 'Items', 'Total']],
        body: detailedSalesData,
        theme: 'grid',
        headStyles: { fillColor: [75, 85, 99] }, // Gray header
        styles: { fontSize: 8 }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save('Reporte_Gerencial_Detallado.pdf');
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Centro de Reportes</h2>
        <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            {sales.length} registros
        </span>
      </div>
      
      {/* KPI Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
             <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Ingresos</p>
             <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">S/ {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
             <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase">Ticket Promedio</p>
             <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">S/ {avgTicket.toFixed(2)}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
             <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase">Top Producto</p>
             <p className="text-lg font-bold text-gray-800 dark:text-white mt-1 truncate">{topProducts[0]?.[0] || '---'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={generatePDFReport} className="flex items-center justify-center gap-3 p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group bg-white dark:bg-gray-800 shadow-sm">
            <div className="bg-brand-100 dark:bg-brand-900/40 p-3 rounded-full group-hover:bg-brand-200 dark:group-hover:bg-brand-800 transition">
                <Download className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="text-left">
                <p className="font-bold text-lg text-gray-800 dark:text-white">Reporte PDF Detallado</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Incluye gráficos y log de transacciones</p>
            </div>
        </button>

        <button onClick={shareViaWhatsApp} className="flex items-center justify-center gap-3 p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group bg-white dark:bg-gray-800 shadow-sm">
            <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-800 transition">
                <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
             <div className="text-left">
                <p className="font-bold text-lg text-gray-800 dark:text-white">Resumen WhatsApp</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enviar métricas clave rápidamente</p>
            </div>
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4" /> Historial Reciente
        </h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-500 uppercase border-b border-gray-200 dark:border-gray-600">
                    <tr>
                        <th className="pb-2">Hora</th>
                        <th className="pb-2">ID</th>
                        <th className="pb-2 text-right">Monto</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {sales.slice().reverse().slice(0, 5).map(s => (
                        <tr key={s.id}>
                            <td className="py-2 text-gray-600 dark:text-gray-300">{new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                            <td className="py-2 text-gray-800 dark:text-white font-medium">{s.id}</td>
                            <td className="py-2 text-right font-bold text-gray-800 dark:text-white">S/ {s.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {sales.length === 0 && <p className="text-center text-gray-400 py-4">No hay ventas registradas</p>}
        </div>
      </div>
    </div>
  );
};

export default ReportsViewer;