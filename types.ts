export enum ProductCategory {
  CERVEZA = 'Cerveza',
  VINO = 'Vino',
  DESTILADO = 'Destilado',
  REFRESCO = 'Refresco',
  SNACK = 'Snack',
  OTRO = 'Otro'
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  capacity: string; // e.g., "750ml"
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  imageUrl?: string;
  isPromo?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  date: string; // ISO string
  items: CartItem[];
  total: number;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape/Plin';
  customerId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  pendingBalance: number;
  totalPurchases: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  category: string;
}

export interface AppState {
  products: Product[];
  sales: Sale[];
  suppliers: Supplier[];
}

export type View = 'DASHBOARD' | 'SALES' | 'INVENTORY' | 'REPORTS';