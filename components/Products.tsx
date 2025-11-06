import React from 'react';
import { products } from '../data/mockData';

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


const Products: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Product List</h2>
            <div className="flex space-x-2">
                 <input type="text" placeholder="Search products..." className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-psu-maroon" />
                 <button className="bg-psu-maroon text-white px-4 py-2 rounded-lg hover:bg-psu-maroon/90 font-semibold transition">Add Product</button>
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
                    </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-200">
                    {products.map(product => (
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Products;