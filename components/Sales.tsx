import React, { useState, useMemo } from 'react';
import type { Product, Sale } from '../types';
import EmptyState from './EmptyState';

interface SalesProps {
  sales: Sale[];
  products: Product[];
}

const Sales: React.FC<SalesProps> = ({ sales, products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

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
  
  const uniqueCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category));
    return ['All Categories', ...Array.from(categories).sort()];
  }, [products]);

  const filteredSales = useMemo(() => 
    detailedSales.filter(sale => {
      const searchMatch = sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sale.productCategory.toLowerCase().includes(searchTerm.toLowerCase());
      
      const categoryMatch = selectedCategory === 'All Categories' || sale.productCategory === selectedCategory;
      
      const dateMatch = (!startDate || sale.saleDate >= startDate) && (!endDate || sale.saleDate <= endDate);

      return searchMatch && categoryMatch && dateMatch;
    }), 
  [detailedSales, searchTerm, startDate, endDate, selectedCategory]);
  
  const summaryData = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
        acc.totalSales += 1;
        acc.totalUnitsSold += sale.quantity;
        acc.totalRevenue += sale.totalAmount;
        return acc;
    }, { totalSales: 0, totalUnitsSold: 0, totalRevenue: 0 });
  }, [filteredSales]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedCategory('All Categories');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">Sales History</h2>
      </div>

      {/* Filters Section */}
      <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label htmlFor="search-sales" className="block text-sm font-medium text-slate-700 mb-1">Search</label>
            <input 
              id="search-sales"
              type="text" 
              placeholder="Search by product or category..." 
              className="px-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-psu-maroon/80 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              id="category-filter"
              className="px-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-psu-maroon/80 transition bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input 
              id="start-date"
              type="date" 
              className="px-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-psu-maroon/80 transition"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input 
              id="end-date"
              type="date" 
              className="px-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-psu-maroon/80 transition"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
           <button 
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300 transition-colors"
            >
              Clear Filters
            </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-blue-600">Total Sales</p>
          <p className="text-2xl font-bold text-blue-800">{summaryData.totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-green-600">Total Units Sold</p>
          <p className="text-2xl font-bold text-green-800">{summaryData.totalUnitsSold.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-yellow-600">Total Revenue</p>
          <p className="text-2xl font-bold text-yellow-800">₱{summaryData.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-100 text-sm font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4 rounded-l-lg">Product Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Sale Date</th>
              <th className="py-3 px-4 text-right">Quantity</th>
              <th className="py-3 px-4 text-right">Price / Item</th>
              <th className="py-3 px-4 text-right rounded-r-lg">Total Amount</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {filteredSales.length > 0 ? filteredSales.map(sale => (
              <tr key={sale.id} className="border-b border-slate-200 even:bg-slate-50 hover:bg-psu-gold/10">
                <td className="py-3 px-4 font-medium">{sale.productName}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{sale.productCategory}</td>
                <td className="py-3 px-4">{new Date(sale.saleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td className="py-3 px-4 text-right">{sale.quantity}</td>
                <td className="py-3 px-4 text-right">₱{sale.pricePerItem.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-semibold">₱{sale.totalAmount.toFixed(2)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No Sales Found"
                    message="No sales records match your current filters. Try adjusting your search or clearing the filters."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
