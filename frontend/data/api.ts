
import type { Product, Sale, User } from '../types';
import * as local from './storage';

// --- HELPER ---
// Small delay to simulate async operation, but strictly local
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- AUTH & USERS ---

export const login = async (username: string, password: string): Promise<User> => {
    // 1. Simulate network delay
    await delay(300);

    // 2. Get users from Local Storage
    const users = local.getStoredUsers();
    
    // 3. Find matching user (Case-insensitive username)
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = users.find(u => 
        u.username.toLowerCase() === cleanUsername && 
        u.password === cleanPassword
    );
    
    if (user) {
        return user;
    }
    
    // 4. Return error if not found (This will be caught by App.tsx)
    throw new Error("Invalid credentials");
};

export const fetchUsers = async (): Promise<User[]> => {
    await delay(200);
    return local.getStoredUsers();
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
    await delay(200);
    const users = local.getStoredUsers();
    
    if (users.some(u => u.username.toLowerCase() === user.username.toLowerCase())) {
        throw new Error("Username already exists");
    }

    const newUser = { ...user, id: Date.now() };
    local.saveStoredUsers([...users, newUser as User]);
    return newUser as User;
};

export const updateUser = async (user: User): Promise<User> => {
    await delay(200);
    const users = local.getStoredUsers();
    const updated = users.map(u => u.id === user.id ? { ...u, ...user } : u);
    local.saveStoredUsers(updated);
    return user;
};

export const deleteUser = async (id: number | string): Promise<void> => {
    await delay(200);
    const users = local.getStoredUsers();
    local.saveStoredUsers(users.filter(u => u.id !== id));
};


// --- PRODUCTS ---

export const fetchProducts = async (): Promise<Product[]> => {
    await delay(200);
    return local.getStoredProducts();
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    await delay(200);
    const products = local.getStoredProducts();
    const newProduct = { ...product, id: Date.now() };
    local.saveStoredProducts([newProduct as Product, ...products]);
    return newProduct as Product;
};

export const updateProduct = async (product: Product): Promise<Product> => {
    await delay(200);
    const products = local.getStoredProducts();
    const updated = products.map(p => p.id === product.id ? product : p);
    local.saveStoredProducts(updated);
    return product;
};

export const deleteProduct = async (id: number | string): Promise<void> => {
    await delay(200);
    const products = local.getStoredProducts();
    local.saveStoredProducts(products.filter(p => p.id !== id));
};

export const addStock = async (id: number | string, quantity: number): Promise<void> => {
    await delay(200);
    const products = local.getStoredProducts();
    const updated = products.map(p => p.id === id ? { ...p, stock: p.stock + quantity } : p);
    local.saveStoredProducts(updated);
};

// --- SALES ---

export const fetchSales = async (): Promise<Sale[]> => {
    await delay(200);
    return local.getStoredSales();
};

export const createSale = async (productId: number | string, quantity: number): Promise<Sale> => {
    await delay(200);
    const products = local.getStoredProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) throw new Error("Product not found");
    if (products[productIndex].stock < quantity) throw new Error("Insufficient stock");
    
    // Update Stock
    products[productIndex].stock -= quantity;
    local.saveStoredProducts(products);

    // Record Sale
    const sales = local.getStoredSales();
    const newSale: Sale = { 
        id: Date.now(), 
        productId, 
        quantity, 
        saleDate: new Date().toISOString().split('T')[0] 
    };
    local.saveStoredSales([newSale, ...sales]);
    
    return newSale;
};

// --- HEALTH CHECK ---
export const checkBackendHealth = async (): Promise<boolean> => {
    // In mock mode, the "backend" is always healthy
    return true;
};
