import React from 'react';
import type { Product, Sale, Page } from '../types';
import { TotalRevenueIcon, ItemsSoldIcon, ProductsIcon, LowStockIcon } from './icons/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  setCurrentPage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales, setCurrentPage }) => {

  // --- Data Processing ---
  const totalRevenue = sales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return acc + (product ? product.price * sale.quantity : 0);
  }, 0);

  const totalItemsSold = sales.reduce((acc, sale) => acc + sale.quantity, 0);

  const totalProducts = products.length;

  const lowStockItems = products.filter(p => p.stock < 10).length;

  const topSellingProducts = sales
    .reduce((acc, sale) => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        acc[product.name] = (acc[product.name] || 0) + sale.quantity;
      }
      return acc;
    }, {} as Record<string, number>);

  const topSellingChartData = Object.entries(topSellingProducts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, quantity]) => ({ name: name.replace(/ \(.+\)/, ''), quantity }));

  const salesOverTime = sales.reduce((acc, sale) => {
    const date = sale.saleDate;
    acc[date] = (acc[date] || 0) + sale.quantity;
    return acc;
  }, {} as Record<string, number>);

  const salesChartData = Object.entries(salesOverTime)
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  const recentSales = sales
    .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
    .slice(0, 5)
    .map(sale => {
      const product = products.find(p => p.id === sale.productId);
      return { ...sale, productName: product?.name || 'Unknown', price: product?.price || 0 };
    });

  // --- Components ---

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    onClick?: () => void;
    color: string;
  }> = ({ icon, title, value, onClick, color }) => (
    <div
      className={`bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`rounded-full p-3 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<TotalRevenueIcon />} title="Total Revenue" value={`₱${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="bg-green-100" />
        <StatCard icon={<ItemsSoldIcon />} title="Items Sold" value={totalItemsSold.toLocaleString()} color="bg-blue-100"/>
        <StatCard icon={<ProductsIcon />} title="Total Products" value={totalProducts.toString()} onClick={() => setCurrentPage('Products')} color="bg-yellow-100"/>
        <StatCard icon={<LowStockIcon />} title="Low Stock Items" value={lowStockItems.toString()} onClick={() => setCurrentPage('Products')} color="bg-red-100" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-gray-800 text-lg mb-4">Sales Over Time</h3>
           <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}/>
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#800000" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-gray-800 text-lg mb-4">Top 5 Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellingChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" hide/>
              <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false}/>
              <Tooltip cursor={{fill: '#f3f4f6'}}/>
              <Legend />
              <Bar dataKey="quantity" fill="#FFD700" name="Units Sold" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Sales Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {recentSales.map(sale => (
                <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{sale.productName}</td>
                  <td className="py-3 px-4">{new Date(sale.saleDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">{sale.quantity}</td>
                  <td className="py-3 px-4 text-right font-semibold">₱{(sale.price * sale.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;