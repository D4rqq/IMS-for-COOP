import React from 'react';
import type { Product } from '../types';
import { MenuCloseIcon, LowStockIcon } from './icons/Icons';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onDelete: () => void;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({ isOpen, onClose, product, onDelete }) => {

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deleteProductModalTitle"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all p-6 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        >
        <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <LowStockIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-slate-900" id="deleteProductModalTitle">
                    Delete Product
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-slate-500">
                        Are you sure you want to delete <span className="font-bold text-slate-700">{product.name}</span>? This action cannot be undone.
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                onClick={onDelete}
            >
                Delete
            </button>
            <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-psu-maroon/80 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                onClick={onClose}
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;