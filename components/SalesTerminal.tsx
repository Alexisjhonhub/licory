import React, { useState, useMemo, useEffect } from 'react';
import { Product, CartItem, ProductCategory, Sale } from '../types';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, FileText, Smartphone } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SalesTerminalProps {
  products: Product[];
  onCompleteSale: (sale: Sale) => void;
}

const SalesTerminal: React.FC<SalesTerminalProps> = ({ products, onCompleteSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape/Plin'>('Efectivo');
  
  // States for Change Calculation
  const [amountPaid, setAmountPaid] = useState<string>('');

  // Reset amount paid when cart changes significantly or payment method changes
  useEffect(() => {
    if (paymentMethod !== 'Efectivo') {
      setAmountPaid('');
    }
  }, [paymentMethod]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Cart logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Calculate Change
  const amountPaidNum = parseFloat(amountPaid) || 0;
  const change = amountPaidNum - cartTotal;
  const isInsufficient = paymentMethod === 'Efectivo' && amountPaidNum < cartTotal && amountPaid !== '';

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'Efectivo' && amountPaidNum < cartTotal) {
        alert("El monto pagado es insuficiente.");
        return;
    }

    const newSale: Sale = {
      id: `B001-${Math.floor(Date.now() / 1000)}`, // Format ID like a Boleta series
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal,
      paymentMethod,
    };

    // Generate Receipt PDF
    generateReceipt(newSale, amountPaidNum, change);

    onCompleteSale(newSale);
    setCart([]);
    setAmountPaid('');
    alert(`¡Venta completada!\n${paymentMethod === 'Efectivo' ? `Vuelto a entregar: S/ ${change.toFixed(2)}` : ''}`);
  };

  const generateReceipt = (sale: Sale, paid: number, changeVal: number) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;

    // --- Variables de Diseño ---
    const colorBlack = '#1a1a1a';
    const colorGray = '#4b5563';
    const colorBrand = '#7e22ce'; // Morado

    // --- Encabezado Empresa ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(colorBlack);
    doc.text('LICORERÍA DON BACCO', margin, 20);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorGray);
    doc.text('Av. Las Torres 123, Lima, Perú', margin, 26);
    doc.text('Tel: (01) 555-0909 | Email: contacto@donbacco.com', margin, 30);

    // --- Recuadro RUC (Derecha) ---
    const rucBoxWidth = 70;
    const rucBoxHeight = 25;
    const rucBoxX = pageWidth - margin - rucBoxWidth;
    const rucBoxY = 15;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(rucBoxX, rucBoxY, rucBoxWidth, rucBoxHeight);

    doc.setFontSize(10);
    doc.setTextColor(colorBlack);
    doc.setFont('helvetica', 'bold');
    doc.text('R.U.C. 20601234567', rucBoxX + rucBoxWidth / 2, rucBoxY + 7, { align: 'center' });
    
    doc.setFillColor(colorBrand); 
    doc.rect(rucBoxX, rucBoxY + 9, rucBoxWidth, 7, 'F'); // Franja morada
    doc.setTextColor(255, 255, 255);
    doc.text('BOLETA DE VENTA ELECTRÓNICA', rucBoxX + rucBoxWidth / 2, rucBoxY + 14, { align: 'center' });
    
    doc.setTextColor(colorBlack);
    doc.text(`${sale.id}`, rucBoxX + rucBoxWidth / 2, rucBoxY + 21, { align: 'center' });

    // --- Datos del Cliente y Emisión ---
    const infoY = 50;
    doc.setFontSize(9);
    doc.setTextColor(colorGray);
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA DE EMISIÓN:', margin, infoY);
    doc.text('CLIENTE:', margin, infoY + 6);
    doc.text('MONEDA:', margin, infoY + 12);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorBlack);
    const dateObj = new Date(sale.date);
    doc.text(dateObj.toLocaleDateString('es-PE') + ' ' + dateObj.toLocaleTimeString('es-PE'), margin + 40, infoY);
    doc.text('CLIENTE GENERAL', margin + 40, infoY + 6);
    doc.text('SOLES (PEN)', margin + 40, infoY + 12);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorGray);
    doc.text('FORMA DE PAGO:', pageWidth / 2 + 10, infoY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorBlack);
    doc.text(sale.paymentMethod.toUpperCase(), pageWidth / 2 + 45, infoY);

    // --- Tabla de Productos ---
    const tableData = sale.items.map(item => [
        item.quantity,
        'UNID',
        item.name + (item.capacity ? ` (${item.capacity})` : ''),
        `S/ ${item.price.toFixed(2)}`,
        `S/ ${(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: infoY + 20,
      head: [['CANT.', 'U.M.', 'DESCRIPCIÓN', 'P. UNIT', 'IMPORTE']],
      body: tableData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: colorBlack,
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [243, 244, 246], // Gris muy claro
        textColor: colorBlack,
        fontStyle: 'bold',
        lineWidth: { bottom: 0.5 },
        lineColor: [200, 200, 200]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 15 },
        2: { halign: 'left' },
        3: { halign: 'right', cellWidth: 25 },
        4: { halign: 'right', cellWidth: 25 }
      },
      didDrawPage: (data) => {
         // Línea simple al final de la tabla
         // @ts-ignore
         const finalY = data.cursor.y;
         doc.setDrawColor(200, 200, 200);
         doc.line(margin, finalY, pageWidth - margin, finalY);
      }
    });

    // --- Cálculos de Totales (Desglose IGV 18%) ---
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 5;
    const rightColX = pageWidth - margin - 25;
    const labelX = pageWidth - margin - 60;
    
    const total = sale.total;
    const baseImponible = total / 1.18;
    const igv = total - baseImponible;

    doc.setFontSize(9);
    
    // Op. Gravada
    doc.setTextColor(colorGray);
    doc.text('OP. GRAVADA:', labelX, finalY, { align: 'right' });
    doc.setTextColor(colorBlack);
    doc.text(`S/ ${baseImponible.toFixed(2)}`, rightColX, finalY, { align: 'right' });

    // IGV
    doc.setTextColor(colorGray);
    doc.text('I.G.V. (18%):', labelX, finalY + 5, { align: 'right' });
    doc.setTextColor(colorBlack);
    doc.text(`S/ ${igv.toFixed(2)}`, rightColX, finalY + 5, { align: 'right' });

    // Total Importe
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorGray);
    doc.text('IMPORTE TOTAL:', labelX, finalY + 12, { align: 'right' });
    doc.setTextColor(colorBrand);
    doc.text(`S/ ${total.toFixed(2)}`, rightColX, finalY + 12, { align: 'right' });

    // --- Pagos (Si es efectivo) ---
    if (sale.paymentMethod === 'Efectivo') {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colorGray);
        doc.text('Efectivo Recibido:', labelX, finalY + 18, { align: 'right' });
        doc.text(`S/ ${paid.toFixed(2)}`, rightColX, finalY + 18, { align: 'right' });
        
        doc.text('Vuelto:', labelX, finalY + 23, { align: 'right' });
        doc.text(`S/ ${changeVal.toFixed(2)}`, rightColX, finalY + 23, { align: 'right' });
    }

    // --- Pie de Página Legal ---
    const footerY = 280;
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Representación impresa de la BOLETA DE VENTA ELECTRÓNICA.', margin, footerY);
    doc.text('Autorizado mediante Resolución de Intendencia N° 034-005-0005432/SUNAT', margin, footerY + 4);
    doc.text('Consulte su documento en www.donbacco.com/facturacion', margin, footerY + 8);

    doc.save(`Boleta_${sale.id}.pdf`);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] md:h-[calc(100vh-6rem)] gap-4">
      {/* Left: Product Catalog */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-600 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('Todos')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'Todos' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            {Object.values(ProductCategory).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex flex-col items-center text-center group h-full justify-between"
              >
                <div className="relative w-full aspect-square mb-2 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    {product.stock <= product.minStock && (
                        <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            Poco Stock
                        </div>
                    )}
                </div>
                <div className="w-full">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm line-clamp-2 leading-tight">{product.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.capacity}</p>
                    <p className="text-brand-600 dark:text-brand-400 font-bold text-lg">S/ {product.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart (Sticky on mobile usually, but side-by-side here for responsiveness) */}
      <div className="w-full md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-1/2 md:h-full">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
            <ShoppingCart className="w-5 h-5" /> Ticket de Venta
          </h2>
          <span className="bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded text-sm font-medium">{cart.reduce((a, b) => a + b.quantity, 0)} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 space-y-2">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between group">
                <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{item.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">S/ {item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button type="button" onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md transition text-gray-600 dark:text-gray-300"><Minus className="w-3 h-3" /></button>
                    <span className="w-4 text-center text-sm font-medium text-gray-800 dark:text-white">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md transition text-gray-600 dark:text-gray-300"><Plus className="w-3 h-3" /></button>
                  </div>
                  <p className="font-bold text-gray-800 dark:text-white w-16 text-right">S/ {(item.price * item.quantity).toFixed(0)}</p>
                  <button type="button" onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl space-y-4">
          <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Método de Pago</label>
              <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => setPaymentMethod('Efectivo')}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${paymentMethod === 'Efectivo' ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                  >
                      <Banknote className="w-4 h-4 mb-1" /> Efec.
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('Yape/Plin')}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${paymentMethod === 'Yape/Plin' ? 'bg-pink-50 dark:bg-pink-900/30 border-pink-500 text-pink-700 dark:text-pink-400' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                  >
                      <Smartphone className="w-4 h-4 mb-1" /> Yape/Plin
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('Tarjeta')}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${paymentMethod === 'Tarjeta' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                  >
                      <CreditCard className="w-4 h-4 mb-1" /> Tarj.
                  </button>
                   <button 
                    onClick={() => setPaymentMethod('Transferencia')}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${paymentMethod === 'Transferencia' ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-400' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                  >
                      <FileText className="w-4 h-4 mb-1" /> Trans.
                  </button>
              </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Total a Pagar:</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">S/ {cartTotal.toFixed(2)}</span>
            </div>

            {/* Change Calculator Logic */}
            {paymentMethod === 'Efectivo' && cart.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monto recibido:</label>
                        <div className="relative w-32">
                             <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                             <input 
                                type="number" 
                                className="w-full pl-8 pr-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-right focus:ring-2 focus:ring-brand-500 outline-none dark:bg-gray-800"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                placeholder="0.00"
                             />
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-yellow-200 dark:border-yellow-800">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">VUELTO:</span>
                        <span className={`text-xl font-bold ${change < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                            S/ {change >= 0 ? change.toFixed(2) : '---'}
                        </span>
                    </div>
                     {isInsufficient && (
                        <p className="text-xs text-red-500 text-right mt-1 font-medium">Monto insuficiente</p>
                    )}
                </div>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || (paymentMethod === 'Efectivo' && amountPaidNum < cartTotal)}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition active:scale-95 ${
              cart.length === 0 || (paymentMethod === 'Efectivo' && amountPaidNum < cartTotal)
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-gray-900 dark:bg-brand-600 text-white hover:bg-gray-800 dark:hover:bg-brand-700'
            }`}
          >
            Cobrar e Imprimir Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesTerminal;