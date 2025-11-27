
import type { Product, Sale, User } from '../types';
import * as storage from './storage';

const API_URL = 'http://localhost:8000/api';

// --- Helper Functions ---

const getAuthToken = () => localStorage.getItem('auth_token');

const getHeaders = (isMultipart = false) => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  let data = null;
  
  if (contentType && contentType.indexOf("application/json") !== -1) {
    data = await response.json();
  }

  if (!response.ok) {
    // Check for validation errors from Laravel (422)
    if (response.status === 422 && data && data.errors) {
        // Flatten errors into a single string
        const errorMsg = Object.values(data.errors).flat().join('\n');
        throw new Error(errorMsg);
    }
    
    // Check for auth errors (401)
    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error("Unauthorized. Please login again.");
    }

    throw new Error(data?.message || data?.error || 'API request failed');
  }
  return data;
};

// --- AUTH & USERS ---

export const login = async (username: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
        },
        body: JSON.stringify({ username, password }),
    });
    
    const json = await handleResponse(response);
    
    // Save Token
    if (json.token) {
        localStorage.setItem('auth_token', json.token);
    }

    // Map Laravel User to Frontend User
    const user = json.user;
    return {
        id: user.id,
        username: user.username,
        fullName: user.full_name, // Map snake_case to camelCase
        role: user.role
    };
  } catch (error) {
    console.warn("Backend login failed. Checking local storage mock...");
    // Fallback for demo purposes if backend is down
    const users = storage.getStoredUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) return user;
    throw error;
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
        headers: getHeaders()
    });
    const json = await handleResponse(response);
    
    // Map Laravel resource collection
    return json.data.map((u: any) => ({
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        role: u.role
    }));
  } catch (error) {
    return storage.getStoredUsers();
  }
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
  try {
    const payload = {
        username: user.username,
        password: user.password,
        full_name: user.fullName, // Map to snake_case
        role: user.role
    };

    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    const json = await handleResponse(response);
    const u = json.data;
    
    return {
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        role: u.role
    };
  } catch (error) {
     throw error;
  }
};

export const updateUser = async (user: User): Promise<User> => {
  try {
    const payload: any = {
        username: user.username,
        full_name: user.fullName,
        role: user.role
    };
    if (user.password) {
        payload.password = user.password;
    }

    const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    const json = await handleResponse(response);
    const u = json.data;
    
    return {
        id: u.id,
        username: u.username,
        fullName: u.full_name,
        role: u.role
    };
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id: number | string): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    await handleResponse(response);
};


// --- PRODUCTS ---

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products`, {
        headers: getHeaders()
    });
    const json = await handleResponse(response);
    
    // Map Laravel fields
    return json.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        stock: p.stock,
        imageUrl: p.image_url // Map snake_case
    }));
  } catch (error) {
    console.warn("Backend unreachable. Serving local products.");
    return storage.getStoredProducts();
  }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const payload = {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image_url: product.imageUrl // Map to snake_case
    };

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await handleResponse(response);
    const p = json.data;
    return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        stock: p.stock,
        imageUrl: p.image_url
    };
};

export const updateProduct = async (product: Product): Promise<Product> => {
    const payload = {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image_url: product.imageUrl
    };

    const response = await fetch(`${API_URL}/products/${product.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await handleResponse(response);
    const p = json.data;
    return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        stock: p.stock,
        imageUrl: p.image_url
    };
};

export const deleteProduct = async (id: number | string): Promise<void> => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    await handleResponse(response);
};

export const addStock = async (id: number | string, quantity: number): Promise<void> => {
    const response = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    });
    await handleResponse(response);
};

// --- SALES ---

export const fetchSales = async (): Promise<Sale[]> => {
  try {
    const response = await fetch(`${API_URL}/sales`, {
        headers: getHeaders()
    });
    const json = await handleResponse(response);
    
    // Map Laravel response structure
    // Laravel Resource returns: { id, product: {...}, quantity, sale_date }
    // Frontend expects: { id, productId, quantity, saleDate }
    return json.data.map((s: any) => ({
        id: s.id,
        productId: s.product.id, // Extract ID from nested object
        quantity: s.quantity,
        saleDate: s.sale_date // Map snake_case
    }));
  } catch (error) {
    return storage.getStoredSales();
  }
};

export const createSale = async (productId: number | string, quantity: number): Promise<Sale> => {
    // Laravel expects product_id
    const payload = {
        product_id: productId,
        quantity: quantity
    };

    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    // Laravel returns just a message on create in the Controller provided: response()->json(['message' => 'Sale created']);
    // So we can't return the full new sale object from the API response alone.
    // However, to keep the UI snappy, we can return a constructed object.
    
    await handleResponse(response);

    return {
        id: Date.now(), // Temporary ID since API doesn't return it in provided controller code
        productId,
        quantity,
        saleDate: new Date().toISOString().split('T')[0]
    };
};
