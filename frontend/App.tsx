import React, { useState, useEffect } from 'react';
import type { Page, Product, Sale, User } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';
import Reports from './components/Reports';
import Users from './components/Users';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
// Use API instead of Storage
import * as api from './data/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Initial state is empty; populated by useEffect
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load data from API when authenticated
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, salesData] = await Promise.all([
        api.fetchProducts(),
        api.fetchSales()
      ]);
      setProducts(productsData);
      setSales(salesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Failed to connect to the backend. Is the server running on port 3001?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = await api.login(username, password);
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('Dashboard');
  };

  const handleAddProduct = async (newProductData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await api.addProduct({
        ...newProductData,
        imageUrl: newProductData.imageUrl || `https://picsum.photos/seed/${Date.now()}/200`,
      });
      setProducts(prev => [newProduct, ...prev]);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      await api.updateProduct(updatedProduct);
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      );
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  const handleDeleteProduct = async (productId: number | string) => {
    try {
      await api.deleteProduct(productId);
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };
  
  const handleAddStock = async (productId: number | string, quantity: number) => {
     try {
       await api.addStock(productId, quantity);
       // Optimistically update UI or refetch
       setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId ? { ...p, stock: p.stock + quantity } : p
        )
      );
     } catch (error) {
      console.error("Error adding stock:", error);
      alert("Failed to add stock.");
     }
  };

  const handleSale = async (productId: number | string, quantity: number) => {
    try {
      const newSale = await api.createSale(productId, quantity);
      
      // Update UI state locally to reflect changes immediately
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId ? { ...p, stock: p.stock - quantity } : p
        )
      );
      setSales(prevSales => [newSale, ...prevSales]);
    } catch (error) {
      console.error("Error recording sale:", error);
      alert("Failed to record sale. Check stock levels.");
    }
  };

  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-psu-maroon"></div>
        </div>
      );
    }

    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard products={products} sales={sales} setCurrentPage={setCurrentPage} />;
      case 'Products':
        return (
          <Products 
            products={products} 
            userRole={currentUser?.role || 'staff'}
            onAddProduct={handleAddProduct} 
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddStock={handleAddStock}
            onSale={handleSale} 
          />
        );
      case 'Sales':
        return <Sales sales={sales} products={products} />;
      case 'Reports':
        return <Reports products={products} sales={sales} />;
      case 'Users':
        return currentUser?.role === 'admin' ? <Users /> : <Dashboard products={products} sales={sales} setCurrentPage={setCurrentPage} />;
      default:
        return <Dashboard products={products} sales={sales} setCurrentPage={setCurrentPage} />;
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        userRole={currentUser.role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentPage={currentPage} 
          setSidebarOpen={setSidebarOpen} 
          onLogout={handleLogout}
          user={currentUser}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;