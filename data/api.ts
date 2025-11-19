import type { Product, Sale } from '../types';

// Assumes backend is running on localhost:3001
const API_URL = 'http://localhost:3001/api';

// Helper to handle response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
};

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_URL}/products`);
  const json = await handleResponse(response);
  return json.data;
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  const json = await handleResponse(response);
  return json.data;
};

export const updateProduct = async (product: Product): Promise<Product> => {
  const response = await fetch(`${API_URL}/products/${product.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  const json = await handleResponse(response);
  return json.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
};

export const addStock = async (id: number, quantity: number): Promise<void> => {
  const response = await fetch(`${API_URL}/products/${id}/stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  await handleResponse(response);
};

export const fetchSales = async (): Promise<Sale[]> => {
  const response = await fetch(`${API_URL}/sales`);
  const json = await handleResponse(response);
  return json.data;
};

export const createSale = async (productId: number, quantity: number): Promise<Sale> => {
  const response = await fetch(`${API_URL}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId,
      quantity,
      saleDate: new Date().toISOString().split('T')[0]
    }),
  });
  const json = await handleResponse(response);
  return json.data;
};
