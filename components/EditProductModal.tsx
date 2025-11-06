import React, { useState, FormEvent, useEffect } from 'react';
import type { Product } from '../types';
import { MenuCloseIcon } from './icons/Icons';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product;
  onEditProduct: (product: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, productToEdit, onEditProduct }) => {
  const [formData, setFormData] = useState<Product>(productToEdit);
  
  useEffect(() => {
    // Update form data when the product to edit changes
    setFormData(productToEdit);
  }, [productToEdit]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'stock') ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || formData.price <= 0) {
        alert('Please fill in all required fields: Name, Category, and a valid Price.');
        return;
    }
    onEditProduct(formData);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editProductModalTitle"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 id="editProductModalTitle" className="text-2xl font-bold text-gray-800">Edit Product</h2>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                >
                    <MenuCloseIcon className="h-6 w-6" />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-psu-maroon focus:border-psu-maroon sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-psu-maroon focus:border-psu-maroon sm:text-sm"
                        required
                    />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₱)</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-psu-maroon focus:border-psu-maroon sm:text-sm"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-psu-maroon focus:border-psu-maroon sm:text-sm"
                            required
                        />
                    </div>
                </div>
                 <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-psu-maroon focus:border-psu-maroon sm:text-sm"
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="bg-psu-maroon text-white px-4 py-2 rounded-lg hover:bg-psu-maroon/90 font-semibold transition"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
