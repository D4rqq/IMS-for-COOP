import React from 'react';
import { EmptyStateIcon, PlusIcon } from './icons/Icons';

interface EmptyStateProps {
  title: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, buttonText, onButtonClick }) => {
  return (
    <div className="text-center py-16 px-6">
      <EmptyStateIcon className="mx-auto h-12 w-12 text-slate-400" />
      <h3 className="mt-4 text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {buttonText && onButtonClick && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onButtonClick}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-psu-maroon hover:bg-psu-maroon/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-psu-maroon/80 transition"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;