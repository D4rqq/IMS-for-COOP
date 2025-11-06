import React, { useState, useMemo } from 'react';
import type { Product, Sale } from '../types';

interface SalesProps {
  sales: Sale[];
  products: Product[];
}

const Sales: React.FC<SalesProps> = ({ sales, products }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const detailedSales = useMemo(() => {
    return sales
      .map(sale => {
        const product = products.find(p => p.id === sale.productId);
        return {
          ...sale,
          productName: product?.name || 'Unknown Product',
          productCategory: product?.category || 'N/A',
          pricePerItem: product?.price || 0,
          totalAmount: product ? product.price * sale.quantity : 0,
        };
      })
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }, [sales, products]);

  const filteredSales = useMemo(() => 
    detailedSales.filter(sale => 
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.productCategory.toLowerCase().includes(searchTerm.toLowerCase())
    ), [detailedSales, searchTerm]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Sales History</h2>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Search sales..." 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-psu-maroon"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-sm font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Sale Date</th>
              <th className="py-3 px-4 text-right">Quantity</th>
              <th className="py-3 px-4 text-right">Price / Item</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 divide-y divide-gray-200">
            {filteredSales.map(sale => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{sale.productName}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{sale.productCategory}</td>
                <td className="py-3 px-4">{new Date(sale.saleDate).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-right">{sale.quantity}</td>
                <td className="py-3 px-4 text-right">₱{sale.pricePerItem.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-semibold">₱{sale.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;