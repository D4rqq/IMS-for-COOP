
export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface Sale {
  id: number | string;
  productId: number | string;
  quantity: number;
  saleDate: string; // ISO 8601 format: "YYYY-MM-DD"
}

export type Page = 'Dashboard' | 'Products' | 'Sales' | 'Reports';