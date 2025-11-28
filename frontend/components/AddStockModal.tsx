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
    if (isOpen) {
        setQuantity(1);
        setError('');
    }
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
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="addStockModalTitle"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        >
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                 <div className="flex flex-col">
                    <h2 id="addStockModalTitle" className="text-2xl font-bold text-slate-800">Add Stock</h2>
                    <p className="text-sm text-slate-500">{product.name}</p>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Close modal"
                >
                    <MenuCloseIcon className="h-6 w-6" />
                </button>
            </div>
             <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-lg text-slate-700">{product.name}</p>
                <p className="text-sm text-slate-500">Current Stock: <span className="font-bold text-slate-700">{product.stock}</span></p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity to Add</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-psu-maroon/80 sm:text-sm transition"
                        required
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <div className="pt-2">
                    <p className="text-xl font-bold text-right text-slate-800">
                        New Stock Total: {product.stock + (quantity || 0)}
                    </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 mt-6">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-sm hover:shadow-md"
                        disabled={!!error || !quantity || quantity <= 0}
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