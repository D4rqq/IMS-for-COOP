
import { Product, Sale } from '../types';
import { products as defaultProducts, sales as defaultSales } from './mockData';

const PRODUCTS_KEY = 'psu_coop_products';
const SALES_KEY = 'psu_coop_sales';

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
