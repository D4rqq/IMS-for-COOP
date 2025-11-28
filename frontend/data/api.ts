import type { Product, Sale, User } from '../types';

const API_URL = 'http://localhost:3001/api';

// --- Helper Functions ---

const getAuthToken = () => localStorage.getItem('auth_token');

const getHeaders = (isMultipart = false) => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  // Note: The simple Node.js backend might not require tokens, 
  // but we keep this logic in case you add JWT later.
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Check if backend is reachable (used by Sidebar status)
export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/products`, { 
            method: 'HEAD',
            headers: getHeaders()
        });
        return response.ok || response.status === 401;
    } catch (e) {
        return false;
    }
};

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  let data = null;
  
  if (contentType && contentType.indexOf("application/json") !== -1) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'API request failed');
  }
  return data;
};

// --- AUTH & USERS ---

export const login = async (username: string, password: string): Promise<User> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
        },
        body: JSON.stringify({ username, password }),
    });
    
    const json = await handleResponse(response);
    
    // The simple Node backend returns { message: "success", data: user }
    // It does not currently return a token.
    const user = json.data;

    return {
        id: user.id,
        username: user.username,
        fullName: user.fullName, // Mongoose uses camelCase
        role: user.role
    };
};

export const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/users`, {
        headers: getHeaders()
    });
    const json = await handleResponse(response);
    
    return json.data.map((u: any) => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        role: u.role
    }));
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
    const payload = {
        username: user.username,
        password: user.password,
        fullName: user.fullName,
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
        fullName: u.fullName,
        role: u.role
    };
};

export const updateUser = async (user: User): Promise<User> => {
    const payload: any = {
        username: user.username,
        fullName: user.fullName,
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
        fullName: u.fullName,
        role: u.role
    };
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
    const response = await fetch(`${API_URL}/products`, {
        headers: getHeaders()
    });
    const json = await handleResponse(response);
    
    return json.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        stock: p.stock,
        imageUrl: p.imageUrl // Mongoose uses camelCase
    }));
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const payload = {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl
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
        imageUrl: p.imageUrl
    };
};

export const updateProduct = async (product: Product): Promise<Product> => {
    const payload = {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl
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
        imageUrl: p.imageUrl
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
    const response = await fetch(`${API_URL}/sales`, {
        headers: getHeaders()
    });
    const json = await handleResponse(response);
    
    return json.data.map((s: any) => ({
        id: s.id,
        productId: s.productId, // Mongoose returns the ID string directly
        quantity: s.quantity,
        saleDate: s.saleDate
    }));
};

export const createSale = async (productId: number | string, quantity: number): Promise<Sale> => {
    const payload = {
        productId: productId,
        quantity: quantity,
        saleDate: new Date().toISOString().split('T')[0] // Provide date from frontend
    };

    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    
    await handleResponse(response);

    return {
        id: Date.now(), // Temporary ID for UI update until refresh
        productId,
        quantity,
        saleDate: payload.saleDate
    };
};