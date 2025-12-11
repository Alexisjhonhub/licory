import React, { useState, useMemo } from 'react';
import { Product, CartItem, ProductCategory, Sale } from '../types';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, FileText } from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');

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

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newSale: Sale = {
      id: `SALE-${Date.now()}`,
      date: new Date().toISOString(),
      items: [...cart],
      total: cartTotal,
      paymentMethod,
    };

    // Generate Receipt PDF
    generateReceipt(newSale);

    onCompleteSale(newSale);
    setCart([]);
    alert('¡Venta completada con éxito!');
  };

  const generateReceipt = (sale: Sale) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Licorería Don Bacco', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Ticket: ${sale.id}`, 14, 30);
    doc.text(`Fecha: ${new Date(sale.date).toLocaleString('es-PE')}`, 14, 35);
    doc.text(`Pago: ${sale.paymentMethod}`, 14, 40);

    const tableData = sale.items.map(item => [
      item.quantity,
      item.name,
      `S/ ${item.price.toFixed(2)}`,
      `S/ ${(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Cant', 'Producto', 'P.Unit', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
    });

    // @ts-ignore - autoTable adds lastAutoTable property
    const finalY = doc.lastAutoTable.finalY || 60;
    
    doc.setFontSize(14);
    doc.text(`Total: S/ ${sale.total.toFixed(2)}`, 14, finalY + 10);
    
    doc.save(`Ticket_${sale.id}.pdf`);
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
              <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setPaymentMethod('Efectivo')}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${paymentMethod === 'Efectivo' ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                  >
                      <Banknote className="w-4 h-4 mb-1" /> Efectivo
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('Tarjeta')}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${paymentMethod === 'Tarjeta' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                  >
                      <CreditCard className="w-4 h-4 mb-1" /> Tarjeta
                  </button>
                   <button 
                    onClick={() => setPaymentMethod('Transferencia')}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition ${paymentMethod === 'Transferencia' ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-400' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                  >
                      <FileText className="w-4 h-4 mb-1" /> Transf.
                  </button>
              </div>
          </div>
          
          <div className="flex justify-between items-end">
            <span className="text-gray-500 dark:text-gray-400">Total a Pagar:</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">S/ {cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition active:scale-95 ${
              cart.length === 0 
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