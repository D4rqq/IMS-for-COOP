
import type { Product, Sale, User } from '../types';
import * as storage from './storage';

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

// --- AUTH & USERS ---

export const login = async (username: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const json = await handleResponse(response);
    return json.data;
  } catch (error) {
    console.warn("Backend unreachable. Falling back to local storage.");
    // Fallback: Check local users
    const users = storage.getStoredUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) return user;
    throw new Error("Invalid username or password");
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users`);
    const json = await handleResponse(response);
    return json.data;
  } catch (error) {
    return storage.getStoredUsers();
  }
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
    const json = await handleResponse(response);
    return json.data;
  } catch (error) {
    const users = storage.getStoredUsers();
    if (users.some(u => u.username === user.username)) {
      throw new Error("Username already exists");
    }
    const newUser = { ...user, id: Date.now() };
    const updatedUsers = [...users, newUser];
    storage.saveStoredUsers(updatedUsers);
    return newUser;
  }
};

export const updateUser = async (user: User): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
    const json = await handleResponse(response);
    return json.data;
  } catch (error) {
    // Fallback logic for local storage
    const users = storage.getStoredUsers();
    
    // Check uniqueness excluding self
    if (users.some(u => u.username === user.username && u.id !== user.id)) {
      throw new Error("Username already exists");
    }

    const updatedUsers = users.map(u => {
        if (u.id === user.id) {
            // Only update password if provided
            const password = (user.password && user.password.trim() !== "") ? user.password : u.password;
            return { ...user, password };
        }
        return u;
    });

    storage.saveStoredUsers(updatedUsers);
    return updatedUsers.find(u => u.id === user.id) as User;
  }
};

export const deleteUser = async (id: number | string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
    });
    await handleResponse(response);
  } catch (error) {
    const users = storage.getStoredUsers();
    const updatedUsers = users.filter(u => u.id !== id);
    storage.saveStoredUsers(updatedUsers);
  }
};


// --- PRODUCTS ---

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products`);
    const json = await handleResponse(response);
    return json.data;
  } catch (error) {
    console.warn("Backend unreachable. Serving local products.");
    return storage.getStoredProducts();
  }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const json = await handleResponse(response);
    return json.data;
  } catch (error) {
    const products = storage.getStoredProducts();
    const newProduct = { ...product, id: Date.now() };
    const updatedProducts = [newProduct, ...products];
    storage.saveStoredProducts(updatedProducts);
    return newProduct;
  }
};

export const updateProduct = async (product: Product): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const json = await handleResponse(response);
    return json.data;
  } catch (error) {
    const products = storage.getStoredProducts();
    const updatedProducts = products.map(p => p.id === product.id ? product : p);
    storage.saveStoredProducts(updatedProducts);
    return product;
  }
};

export const deleteProduct = async (id: number | string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  } catch (error) {
    const products = storage.getStoredProducts();
    const updatedProducts = products.filter(p => p.id !== id);
    storage.saveStoredProducts(updatedProducts);
  }
};

export const addStock = async (id: number | string, quantity: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    await handleResponse(response);
  } catch (error) {
    const products = storage.getStoredProducts();
    const updatedProducts = products.map(p => 
      p.id === id ? { ...p, stock: p.stock + quantity } : p
    );
    storage.saveStoredProducts(updatedProducts);
  }
};

// --- SALES ---

export const fetchSales = async (): Promise<Sale[]> => {
  try {
    const response = await fetch(`${API_URL}/sales`);
    const json = await handleResponse(response);
    return json.data;
  } catch (error) {
    return storage.getStoredSales();
  }
};

export const createSale = async (productId: number | string, quantity: number): Promise<Sale> => {
  try {
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
  } catch (error) {
    // Fallback logic simulating backend transaction
    const products = storage.getStoredProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) throw new Error("Product not found");
    if (products[productIndex].stock < quantity) throw new Error("Insufficient stock");
    
    // Update stock
    products[productIndex] = { ...products[productIndex], stock: products[productIndex].stock - quantity };
    storage.saveStoredProducts(products);

    // Create sale
    const sales = storage.getStoredSales();
    const newSale: Sale = {
      id: Date.now(),
      productId,
      quantity,
      saleDate: new Date().toISOString().split('T')[0]
    };
    const updatedSales = [newSale, ...sales];
    storage.saveStoredSales(updatedSales);
    
    return newSale;
  }
};