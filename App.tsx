import React, { useState } from 'react';
import type { Page, Product, Sale } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';
import Header from './components/Header';
import { products as initialProducts, sales as initialSales } from './data/mockData';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<Sale[]>(initialSales);

  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      ...newProductData,
      id: newId,
      imageUrl: newProductData.imageUrl || `https://picsum.photos/seed/${newId}/200`,
    };
    setProducts(prevProducts => [newProduct, ...prevProducts]);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };
  
  const handleAddStock = (productId: number, quantity: number) => {
     setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, stock: p.stock + quantity } : p
      )
    );
  };

  const handleSale = (productId: number, quantity: number) => {
    // 1. Update product stock
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, stock: p.stock - quantity } : p
      )
    );

    // 2. Add new sale record
    const newSaleId = sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1;
    const newSale: Sale = {
      id: newSaleId,
      productId: productId,
      quantity: quantity,
      saleDate: new Date().toISOString().split('T')[0], // Use today's date
    };
    setSales(prevSales => [newSale, ...prevSales]);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard products={products} sales={sales} setCurrentPage={setCurrentPage} />;
      case 'Products':
        return (
          <Products 
            products={products} 
            onAddProduct={handleAddProduct} 
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddStock={handleAddStock}
            onSale={handleSale} 
          />
        );
      case 'Sales':
        return <Sales sales={sales} products={products} />;
      default:
        return <Dashboard products={products} sales={sales} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
