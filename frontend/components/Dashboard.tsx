import React, { useState, useMemo } from 'react';
import type { Product, Sale, Page } from '../types';
import { TotalRevenueIcon, ItemsSoldIcon, ProductsIcon, LowStockIcon, DollarSignIcon } from './icons/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  setCurrentPage: (page: Page) => void;
}

type TimeRange = '7d' | '30d' | '6m';

const Dashboard: React.FC<DashboardProps> = ({ products, sales, setCurrentPage }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // --- Data Processing Helpers ---
  
  // Calculate date thresholds
  const today = new Date();
  const getStartDate = (range: TimeRange) => {
    const d = new Date(today);
    if (range === '7d') d.setDate(d.getDate() - 7);
    if (range === '30d') d.setDate(d.getDate() - 30);
    if (range === '6m') d.setMonth(d.getMonth() - 6);
    return d;
  };

  const startDate = getStartDate(timeRange);

  // Filter sales based on selected time range
  const filteredSales = useMemo(() => {
    return sales.filter(s => new Date(s.saleDate) >= startDate);
  }, [sales, startDate]);

  // --- KPI Metrics ---
  
  const totalRevenue = filteredSales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return acc + (product ? product.price * sale.quantity : 0);
  }, 0);

  const totalItemsSold = filteredSales.reduce((acc, sale) => acc + sale.quantity, 0);

  // Average Sale Value (Revenue / Number of individual sale records)
  // Note: A 'Sale' object currently represents a line item. 
  const averageSaleValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.stock < 10).length;

  // --- Charts Data ---

  // 1. Sales Trend Chart
  const salesTrendData = useMemo(() => {
    const data: Record<string, { date: string; revenue: number; items: number }> = {};
    
    filteredSales.forEach(sale => {
      const product = products.find(p => p.id === sale.productId);
      if (!product) return;
      
      let key = sale.saleDate;
      // If viewing 6 months, group by Month (YYYY-MM)
      if (timeRange === '6m') {
        key = sale.saleDate.substring(0, 7); // "2023-10"
      }

      if (!data[key]) {
        data[key] = { date: key, revenue: 0, items: 0 };
      }
      data[key].revenue += product.price * sale.quantity;
      data[key].items += sale.quantity;
    });

    return Object.values(data).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales, products, timeRange]);


  // 2. Sales by Category (Pie Chart) - Based on Revenue
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        cats[product.category] = (cats[product.category] || 0) + (product.price * sale.quantity);
      }
    });
    
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSales, products]);
  
  const PIE_COLORS = ['#800000', '#FDB813', '#DC2626', '#3b82f6', '#10b981', '#6366f1'];


  // 3. Top Selling Products
  const topSellingProducts = filteredSales
    .reduce((acc, sale) => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        acc[product.name] = (acc[product.name] || 0) + sale.quantity;
      }
      return acc;
    }, {} as Record<string, number>);

  const topSellingChartData = Object.entries(topSellingProducts)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 5)
    .map(([name, quantity]) => ({ name: name.replace(/ \(.+\)/, ''), quantity }));


  // 4. Recent Sales Table
  const recentSales = [...sales] // Use all sales, not just filtered, for the "Recent" log
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
    subtext?: string;
    onClick?: () => void;
    color: string;
  }> = ({ icon, title, value, subtext, onClick, color }) => (
    <div
      className={`bg-white p-5 rounded-lg shadow-md flex items-center space-x-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`rounded-full p-3 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-scale">
      {/* Date Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm">
         <h2 className="text-lg font-bold text-slate-700 mb-3 sm:mb-0">Dashboard Overview</h2>
         <div className="flex bg-slate-100 rounded-lg p-1">
            {(['7d', '30d', '6m'] as TimeRange[]).map((range) => (
                <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        timeRange === range 
                        ? 'bg-white text-psu-maroon shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 6 Months'}
                </button>
            ))}
         </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
            icon={<TotalRevenueIcon />} 
            title="Total Revenue" 
            value={`₱${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
            subtext="in selected period"
            color="bg-green-100" 
            onClick={() => setCurrentPage('Sales')}
        />
        <StatCard 
            icon={<ItemsSoldIcon />} 
            title="Items Sold" 
            value={totalItemsSold.toLocaleString()} 
            subtext="in selected period"
            color="bg-blue-100"
            onClick={() => setCurrentPage('Sales')}
        />
        <StatCard 
            icon={<DollarSignIcon className="w-6 h-6 text-purple-500" />} 
            title="Avg Sale Value" 
            value={`₱${averageSaleValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            subtext="per transaction" 
            color="bg-purple-100"
            onClick={() => setCurrentPage('Sales')}
        />
        <StatCard 
            icon={<ProductsIcon className="w-6 h-6 text-yellow-500" />} 
            title="Total Products" 
            value={totalProducts.toString()} 
            onClick={() => setCurrentPage('Products')} 
            color="bg-yellow-100"
        />
        <StatCard 
            icon={<LowStockIcon />} 
            title="Low Stock" 
            value={lowStockItems.toString()} 
            onClick={() => setCurrentPage('Products')} 
            color="bg-red-100" 
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Revenue Trend</h3>
           <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis 
                dataKey="date" 
                fontSize={12} 
                tickFormatter={(tick) => {
                    // If monthly view, show "Oct 2023", else "Oct 24"
                    const date = new Date(tick);
                    return timeRange === '6m' 
                        ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }} 
                tick={{ fill: '#64748b' }}
                minTickGap={30}
              />
              <YAxis 
                tick={{ fill: '#64748b' }} 
                tickFormatter={(value) => `₱${value/1000}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Revenue"
                stroke="#800000" 
                strokeWidth={3} 
                activeDot={{ r: 6, fill: '#800000', stroke: '#fff', strokeWidth: 2 }} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `₱${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Top Selling Products */}
         <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Top 5 Products (Units Sold)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellingChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false}/>
              <XAxis type="number" hide/>
              <YAxis dataKey="name" type="category" width={120} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }}/>
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }}/>
              <Bar dataKey="quantity" fill="#FDB813" name="Units Sold" barSize={20} radius={[0, 4, 4, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Sales Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                <tr className="bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-lg">Product</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Qty</th>
                    <th className="py-3 px-4 text-right rounded-r-lg">Total</th>
                </tr>
                </thead>
                <tbody className="text-slate-700">
                {recentSales.map(sale => (
                    <tr key={sale.id} className="border-b border-slate-200 hover:bg-slate-50 text-sm">
                    <td className="py-3 px-4 font-medium truncate max-w-[150px]">{sale.productName}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{new Date(sale.saleDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">{sale.quantity}</td>
                    <td className="py-3 px-4 text-right font-semibold">₱{(sale.price * sale.quantity).toFixed(0)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;