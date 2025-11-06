import React, { useState, useMemo } from 'react';
import type { Product } from '../types';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import SellProductModal from './SellProductModal';
import AddStockModal from './AddStockModal';
import DeleteProductModal from './DeleteProductModal';
import { PlusIcon, DollarSignIcon, EditIcon, DeleteIcon, AddStockIcon } from './icons/Icons';

interface ProductsProps {
  products: Product[];
  onAddProduct: (newProduct: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onAddStock: (productId: number, quantity: number) => void;
  onSale: (productId: number, quantity: number) => void;
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
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor}`}>
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
  };

  const openAddStockModal = (product: Product) => {
    setProductToAddStock(product);
    setAddStockModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
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
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Product List</h2>
              <div className="flex space-x-2">
                   <input 
                      type="text" 
                      placeholder="Search products..." 
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-psu-maroon"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                   <button 
                      className="bg-psu-maroon text-white px-4 py-2 rounded-lg hover:bg-psu-maroon/90 font-semibold transition flex items-center justify-center"
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
                      <tr className="bg-gray-50 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          <th className="py-3 px-4"></th>
                          <th className="py-3 px-4">Product Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 text-right">Price</th>
                          <th className="py-3 px-4 text-center">Stock</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="text-gray-700 divide-y divide-gray-200">
                      {filteredProducts.map(product => (
                          <tr key={product.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4">
                                  <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-md object-cover"/>
                              </td>
                              <td className="py-3 px-4 font-medium">{product.name}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{product.category}</td>
                              <td className="py-3 px-4 text-right font-semibold">₱{product.price.toFixed(2)}</td>
                              <td className="py-3 px-4 text-center">{product.stock}</td>
                              <td className="py-3 px-4 text-center">
                                  <StockStatusBadge stock={product.stock} />
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center items-center space-x-2">
                                    <button 
                                        onClick={() => openSellModal(product)}
                                        disabled={product.stock === 0}
                                        className="p-2 rounded-full text-green-600 hover:bg-green-100 disabled:text-gray-300 disabled:bg-transparent transition"
                                        title="Sell Product"
                                    >
                                        <DollarSignIcon />
                                    </button>
                                    <button 
                                        onClick={() => openAddStockModal(product)}
                                        className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition"
                                        title="Add Stock"
                                    >
                                        <AddStockIcon />
                                    </button>
                                     <button 
                                        onClick={() => openEditModal(product)}
                                        className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 transition"
                                        title="Edit Product"
                                    >
                                        <EditIcon />
                                    </button>
                                     <button 
                                        onClick={() => openDeleteModal(product)}
                                        className="p-2 rounded-full text-red-600 hover:bg-red-100 transition"
                                        title="Delete Product"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                              </td>
                          </tr>
                      ))}
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
