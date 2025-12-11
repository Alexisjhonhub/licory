import React, { useState } from 'react';
import { Product, ProductCategory } from '../types';
import { Plus, Edit2, Trash2, Save, X, Search, FileDown, Upload, Image as ImageIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

interface InventoryManagerProps {
  products: Product[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const initialFormState: Omit<Product, 'id'> = {
    name: '', brand: '', category: ProductCategory.CERVEZA, capacity: '', price: 0, cost: 0, stock: 0, minStock: 10, imageUrl: 'https://picsum.photos/200', isPromo: false
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({ ...product });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateProduct({ ...formData, id: editingId });
    } else {
      onAddProduct({ ...formData, id: Date.now().toString() });
    }
    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, "Inventario_DonBacco.xlsx");
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[calc(100vh-6rem)]">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Inventario</h2>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Buscar producto..." 
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-600 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                type="button"
                onClick={exportToExcel}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 transition"
                title="Exportar Excel"
            >
                <FileDown className="w-5 h-5" />
            </button>
            <button 
            type="button"
            onClick={() => handleOpenModal()}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-brand-700 transition"
            >
            <Plus className="w-4 h-4" /> Agregar
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producto</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Categoría</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Precio</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Stock</th>
              <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-700 overflow-hidden hidden sm:block">
                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.brand} - {product.capacity}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">
                    <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium">{product.category}</span>
                </td>
                <td className="p-4 text-sm font-bold text-gray-900 dark:text-white text-right">S/ {product.price}</td>
                <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock <= product.minStock ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {product.stock}
                    </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenModal(product); }} className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 p-1.5 rounded-md transition"><Edit2 className="w-4 h-4" /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteProduct(product.id); }} className="text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 p-1.5 rounded-md transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Imagen del Producto</label>
                  <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className="w-24 h-24 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center shrink-0">
                          {formData.imageUrl ? (
                              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                              <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                          )}
                      </div>
                      <div className="flex-1 space-y-3">
                          <div>
                            <input 
                                type="text" 
                                placeholder="URL de la imagen (https://...)" 
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                                value={formData.imageUrl || ''}
                                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                            />
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Pega una URL o sube un archivo local</p>
                          </div>
                          <div className="relative">
                              <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleImageUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <button type="button" className="w-full py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition">
                                  <Upload className="w-4 h-4" /> Subir Imagen
                              </button>
                          </div>
                      </div>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Producto</label>
                <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca</label>
                    <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                    <select className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})}>
                        {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Costo</label>
                    <input required type="number" min="0" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio Venta</label>
                    <input required type="number" min="0" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacidad</label>
                    <input required type="text" placeholder="750ml" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Actual</label>
                    <input required type="number" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Mínimo</label>
                    <input required type="number" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.minStock} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <input type="checkbox" id="promo" className="w-4 h-4 text-brand-600 rounded border-gray-300 dark:border-gray-600" checked={formData.isPromo} onChange={e => setFormData({...formData, isPromo: e.target.checked})} />
                 <label htmlFor="promo" className="text-sm text-gray-700 dark:text-gray-300">¿Es una promoción/combo?</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex justify-center items-center gap-2">
                    <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;