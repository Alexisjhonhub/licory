import { Product, ProductCategory, Customer, Supplier, Sale } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cerveza Corona Extra',
    brand: 'Modelo',
    category: ProductCategory.CERVEZA,
    capacity: '355ml',
    price: 25,
    cost: 18,
    stock: 120,
    minStock: 24,
    imageUrl: 'https://picsum.photos/200/200',
    isPromo: false
  },
  {
    id: '2',
    name: 'Whisky Black Label',
    brand: 'Johnnie Walker',
    category: ProductCategory.DESTILADO,
    capacity: '750ml',
    price: 850,
    cost: 600,
    stock: 5,
    minStock: 8,
    imageUrl: 'https://picsum.photos/201/201',
    isPromo: true
  },
  {
    id: '3',
    name: 'Vino Tinto Reservado',
    brand: 'Concha y Toro',
    category: ProductCategory.VINO,
    capacity: '750ml',
    price: 180,
    cost: 120,
    stock: 15,
    minStock: 10,
    imageUrl: 'https://picsum.photos/202/202',
    isPromo: false
  },
  {
    id: '4',
    name: 'Ron Añejo',
    brand: 'Bacardi',
    category: ProductCategory.DESTILADO,
    capacity: '1L',
    price: 220,
    cost: 150,
    stock: 40,
    minStock: 12,
    imageUrl: 'https://picsum.photos/203/203',
    isPromo: false
  },
  {
    id: '5',
    name: 'Refresco Cola',
    brand: 'Coca Cola',
    category: ProductCategory.REFRESCO,
    capacity: '2L',
    price: 35,
    cost: 25,
    stock: 50,
    minStock: 20,
    imageUrl: 'https://picsum.photos/204/204',
    isPromo: false
  },
   {
    id: '6',
    name: 'Papas Fritas Sal',
    brand: 'Sabritas',
    category: ProductCategory.SNACK,
    capacity: '140g',
    price: 45,
    cost: 30,
    stock: 15,
    minStock: 15,
    imageUrl: 'https://picsum.photos/205/205',
    isPromo: false
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Juan Pérez', phone: '555-0101', pendingBalance: 0, totalPurchases: 1500 },
  { id: 'c2', name: 'Maria López', phone: '555-0102', pendingBalance: 200, totalPurchases: 3200 },
  { id: 'c3', name: 'Restaurante El Asador', phone: '555-0999', pendingBalance: 0, totalPurchases: 15000 },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Distribuidora de Licores SA', contact: 'Carlos Ruiz', category: 'General' },
  { id: 's2', name: 'Cervecería Modelo', contact: 'Ventas Directas', category: 'Cerveza' },
];

// Generate some past sales
export const MOCK_SALES: Sale[] = [
    {
        id: 's-100',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        items: [
            { ...MOCK_PRODUCTS[0], quantity: 6 },
            { ...MOCK_PRODUCTS[5], quantity: 2 }
        ],
        total: 240,
        paymentMethod: 'Efectivo'
    },
    {
        id: 's-101',
        date: new Date().toISOString(), // Today
        items: [
            { ...MOCK_PRODUCTS[1], quantity: 1 }
        ],
        total: 850,
        paymentMethod: 'Tarjeta'
    }
];
