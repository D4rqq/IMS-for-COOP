
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface Sale {
  id: number;
  productId: number;
  quantity: number;
  saleDate: string; // ISO 8601 format: "YYYY-MM-DD"
}

export type Page = 'Dashboard' | 'Products' | 'Sales' | 'Reports';
