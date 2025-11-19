import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Product } from '../types';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import SellProductModal from './SellProductModal';
import AddStockModal from './AddStockModal';
import DeleteProductModal from './DeleteProductModal';
import EmptyState from './EmptyState';
import { PlusIcon, DollarSignIcon, EditIcon, DeleteIcon, AddStockIcon, KebabMenuIcon } from './icons/Icons';

interface ProductsProps {
  products: Product[];
  onAddProduct: (newProduct: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number | string) => void;
  onAddStock: (productId: number | string, quantity: number) => void;
  onSale: (productId: number | string, quantity: number) => void;
}

const StockStatusBadge: React.FC<{ stock: number }> = ({ stock }) => {
  let bgColor = 'bg-green-100 text-green-800';
  let text = 'In Stock';

  if (stock === 0) {
    bgColor = 'bg-red-100 text-red-800';
    text = 'Out of Stock';
  } else if (stock < 10) {
    bgColor = 'bg-yellow-100 text-yellow-800';
    text = 'Low Stock';
  }

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor}`}>
      {text}
    </span>
  );
};

const Products: React.FC<ProductsProps> = ({ products, onAddProduct, onEditProduct, onDeleteProduct, onAddStock, onSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddStockModalOpen, setAddStockModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // State for the currently selected product for different actions
  const [productForSale, setProductForSale] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToAddStock, setProductToAddStock] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<number | string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredProducts = useMemo(() => 
    products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name)), // Sort alphabetically
    [products, searchTerm]);

  // --- Modal Handlers ---
  const openSellModal = (product: Product) => {
    setProductForSale(product);
    setSellModalOpen(true);
  };
  
  const openEditModal = (product: Product) => {
    setProductToEdit(product);
    setEditModalOpen(true);
    setOpenActionMenuId(null);
  };

  const openAddStockModal = (product: Product) => {
    setProductToAddStock(product);
    setAddStockModalOpen(true);
    setOpenActionMenuId(null);
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
    setOpenActionMenuId(null);
  };

  // --- Action Handlers ---
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    onAddProduct(newProductData);
    setAddModalOpen(false);
  };
  
  const handleEditProduct = (updatedProduct: Product) => {
    onEditProduct(updatedProduct);
    setEditModalOpen(false);
  };

  const handleSellProduct = (quantity: number) => {
    if (productForSale) {
      onSale(productForSale.id, quantity);
    }
    setSellModalOpen(false);
  }

  const handleAddStock = (quantity: number) => {
    if (productToAddStock) {
      onAddStock(productToAddStock.id, quantity);
    }
    setAddStockModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
    }
    setDeleteModalOpen(false);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">Product Management</h2>
              <div className="flex w-full sm:w-auto space-x-2">
                   <input 
                      type="text" 
                      placeholder="Search products..." 
                      className="px-4 py-2 w-full sm:w-64 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-psu-maroon/80 transition"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                   <button 
                      className="bg-psu-maroon text-white px-4 py-2 rounded-lg hover:bg-psu-maroon/90 font-semibold transition-colors flex items-center justify-center shadow-sm hover:shadow-md"
                      onClick={() => setAddModalOpen(true)}
                   >
                    <PlusIcon className="mr-2" />
                    Add Product
                   </button>
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="bg-slate-100 text-sm font-semibold text-slate-600 uppercase tracking-wider">
                          <th className="py-3 px-4 rounded-l-lg">Product</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 text-right">Price</th>
                          <th className="py-3 px-4 text-center">Stock</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-center rounded-r-lg">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="text-slate-700">
                      {filteredProducts.length > 0 ? filteredProducts.map(product => (
                          <tr key={product.id} className="border-b border-slate-200 even:bg-slate-50 hover:bg-psu-gold/10">
                              <td className="py-3 px-4">
                                  <div className="flex items-center space-x-3">
                                    <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-md object-cover"/>
                                    <span className="font-medium">{product.name}</span>
                                  </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-600">{product.category}</td>
                              <td className="py-3 px-4 text-right font-semibold">₱{product.price.toFixed(2)}</td>
                              <td className="py-3 px-4 text-center font-medium">{product.stock}</td>
                              <td className="py-3 px-4 text-center">
                                  <StockStatusBadge stock={product.stock} />
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center items-center space-x-1">
                                    <button 
                                        onClick={() => openSellModal(product)}
                                        disabled={product.stock === 0}
                                        className="p-2 rounded-full text-green-600 hover:bg-green-100 disabled:text-slate-300 disabled:bg-transparent transition-colors"
                                        title="Sell Product"
                                    >
                                        <DollarSignIcon />
                                    </button>
                                    <div className="relative" ref={openActionMenuId === product.id ? menuRef : null}>
                                        <button 
                                            onClick={() => setOpenActionMenuId(openActionMenuId === product.id ? null : product.id)}
                                            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                                            title="More Actions"
                                        >
                                          <KebabMenuIcon />
                                        </button>
                                        {openActionMenuId === product.id && (
                                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-slate-200 animate-fade-in-scale origin-top-right">
                                            <div className="py-1">
                                              <a href="#" onClick={(e) => { e.preventDefault(); openAddStockModal(product); }} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                                <AddStockIcon className="mr-3" /> Add Stock
                                              </a>
                                              <a href="#" onClick={(e) => { e.preventDefault(); openEditModal(product); }} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                                <EditIcon className="mr-3" /> Edit Product
                                              </a>
                                              <div className="border-t border-slate-200 my-1"></div>
                                              <a href="#" onClick={(e) => { e.preventDefault(); openDeleteModal(product); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                <DeleteIcon className="mr-3"/> Delete
                                              </a>
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                </div>
                              </td>
                          </tr>
                      )) : (
                        <tr>
                            <td colSpan={6}>
                                <EmptyState 
                                    title="No Products Found"
                                    message="Get started by adding your first product to the inventory."
                                    buttonText="Add Product"
                                    onButtonClick={() => setAddModalOpen(true)}
                                />
                            </td>
                        </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
      
      {/* Modals */}
      <AddProductModal 
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
      {productToEdit && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          productToEdit={productToEdit}
          onEditProduct={handleEditProduct}
        />
      )}
      {productForSale && (
        <SellProductModal
            isOpen={isSellModalOpen}
            onClose={() => setSellModalOpen(false)}
            product={productForSale}
            onSell={handleSellProduct}
        />
      )}
       {productToAddStock && (
        <AddStockModal
          isOpen={isAddStockModalOpen}
          onClose={() => setAddStockModalOpen(false)}
          product={productToAddStock}
          onAddStock={handleAddStock}
        />
      )}
       {productToDelete && (
        <DeleteProductModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          product={productToDelete}
          onDelete={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default Products;