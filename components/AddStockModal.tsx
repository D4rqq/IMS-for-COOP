import React, { useState, FormEvent, useEffect } from 'react';
import type { Product } from '../types';
import { MenuCloseIcon } from './icons/Icons';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddStock: (quantity: number) => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ isOpen, onClose, product, onAddStock }) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset state when modal opens
    setQuantity(1);
    setError('');
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
     if (isNaN(value) || value < 1) {
        setQuantity(1);
        setError('Quantity must be at least 1.');
    } else {
        setQuantity(value);
        setError('');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (quantity > 0) {
        onAddStock(quantity);
    } else {
        setError('Please enter a valid quantity.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="addStockModalTitle"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 id="addStockModalTitle" className="text-2xl font-bold text-gray-800">Add Stock</h2>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                >
                    <MenuCloseIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="mb-4">
                <p className="font-semibold text-lg text-gray-700">{product.name}</p>
                <p className="text-sm text-gray-500">Current Stock: {product.stock}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity to Add</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-psu-maroon focus:border-psu-maroon sm:text-sm"
                        required
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <div className="pt-2">
                    <p className="text-lg font-bold text-right text-gray-800">
                        New Stock Total: {product.stock + quantity}
                    </p>
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
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
                        disabled={!!error || quantity <= 0}
                    >
                        Add to Stock
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;
