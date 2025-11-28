import React, { useState, FormEvent, useEffect } from 'react';
import type { Product } from '../types';
import { MenuCloseIcon } from './icons/Icons';

interface SellProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSell: (quantity: number) => void;
}

const SellProductModal: React.FC<SellProductModalProps> = ({ isOpen, onClose, product, onSell }) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset state when modal opens or product changes
    if (isOpen) {
      setQuantity(1);
      setError('');
    }
  }, [isOpen, product]);

  if (!isOpen) {
    return null;
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
        setQuantity(1);
    } else if (value > product.stock) {
        setQuantity(product.stock);
        setError(`Cannot sell more than available stock (${product.stock})`);
    } else {
        setQuantity(value);
        setError('');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (quantity > 0 && quantity <= product.stock) {
        onSell(quantity);
    } else {
        setError('Invalid quantity specified.');
    }
  };

  const totalAmount = (product.price * quantity).toFixed(2);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sellProductModalTitle"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        >
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                    <h2 id="sellProductModalTitle" className="text-2xl font-bold text-slate-800">Sell Product</h2>
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
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="font-semibold text-lg text-slate-700">{product.name}</p>
                    <p className="text-sm text-slate-500">Available Stock: <span className="font-bold text-slate-700">{product.stock}</span></p>
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity to Sell</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                        max={product.stock}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-psu-maroon/80 sm:text-sm transition"
                        required
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <div className="pt-2">
                    <p className="text-xl font-bold text-right text-slate-800">
                        Total: ₱{totalAmount}
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
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition-colors shadow-sm hover:shadow-md"
                        disabled={!!error || quantity <= 0}
                    >
                        Confirm Sale
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SellProductModal;