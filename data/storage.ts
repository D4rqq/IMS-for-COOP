
import { Product, Sale, User } from '../types';
import { products as defaultProducts, sales as defaultSales } from './mockData';

const PRODUCTS_KEY = 'psu_coop_products';
const SALES_KEY = 'psu_coop_sales';
const USERS_KEY = 'psu_coop_users';

// --- Products ---
export const getStoredProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading products from storage:', error);
  }
  return defaultProducts;
};

export const saveStoredProducts = (products: Product[]) => {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to storage:', error);
  }
};

// --- Sales ---
export const getStoredSales = (): Sale[] => {
  try {
    const stored = localStorage.getItem(SALES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading sales from storage:', error);
  }
  return defaultSales;
};

export const saveStoredSales = (sales: Sale[]) => {
  try {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  } catch (error) {
    console.error('Error saving sales to storage:', error);
  }
};

// --- Users ---
const defaultUsers: User[] = [
  { id: 1, username: 'admin', password: 'password', fullName: 'Admin User', role: 'admin' },
  { id: 2, username: 'staff', password: 'password', fullName: 'Staff Member', role: 'staff' }
];

export const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading users from storage:', error);
  }
  return defaultUsers;
};

export const saveStoredUsers = (users: User[]) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to storage:', error);
  }
};
