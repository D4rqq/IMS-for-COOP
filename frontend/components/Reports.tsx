import React from 'react';
import type { Product, Sale } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface ReportsProps {
  products: Product[];
  sales: Sale[];
}

// --- Custom Tooltip Components ---

const CustomTooltipWithProducts = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dateLabel = new Date(data.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
      <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm text-sm w-60">
        <p className="font-bold text-slate-800 mb-2">{dateLabel}</p>
        <p className="text-slate-600 font-semibold">{`Total Units Sold: ${data.sales}`}</p>
        {data.productsSold && data.productsSold.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-200">
            <ul className="text-slate-600 max-h-32 overflow-y-auto custom-scrollbar">
              {[...data.productsSold].sort((a: any,b: any) => b.quantity - a.quantity).map((p: any, index: number) => (
                <li key={index} className="text-xs truncate">{`• ${p.name} (x${p.quantity})`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  return null;
};


const Reports: React.FC<ReportsProps> = ({ products, sales }) => {

    // --- Chart 1: Stock Levels Data ---
    const stockData = [...products]
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 10)
        .map(p => ({ name: p.name.replace(/ \(.+\)/, ''), stock: p.stock }));

    // --- Chart 2: Weekly Sales Data ---
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const weeklySalesData = last7Days.map(date => {
        const salesOnDay = sales.filter(sale => sale.saleDate === date);
        const totalSales = salesOnDay.reduce((acc, sale) => acc + sale.quantity, 0);
        const productsSold = salesOnDay.map(sale => {
            const product = products.find(p => p.id === sale.productId);
            return { name: product?.name || 'Unknown', quantity: sale.quantity };
        }).reduce((acc, curr) => { // Group by name
            const existing = acc.find(item => item.name === curr.name);
            if (existing) {
                existing.quantity += curr.quantity;
            } else {
                acc.push({ name: curr.name, quantity: curr.quantity });
            }
            return acc;
        }, [] as {name: string, quantity: number}[]);

        return {
            date,
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            sales: totalSales,
            productsSold
        };
    });

    // --- Chart 3: Inventory vs Sold Data ---
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const totalSold = sales.reduce((acc, s) => acc + s.quantity, 0);
    const inventoryPieData = [
        { name: 'Items in Stock', value: totalStock },
        { name: 'Items Sold (All Time)', value: totalSold },
    ];
    const PIE_COLORS = ['#10b981', '#DC2626']; // Green for stock, Red for sold

    // --- Chart 4 & 5: Aggregated Sales Data ---
    const salesByDate: Record<string, { total: number; products: { name: string; quantity: number }[] }> = sales.reduce((acc, sale) => {
        const date = sale.saleDate;
        if (!acc[date]) {
            acc[date] = { total: 0, products: [] };
        }
        acc[date].total += sale.quantity;
        const product = products.find(p => p.id === sale.productId);
        acc[date].products.push({ name: product?.name || 'Unknown', quantity: sale.quantity });
        return acc;
    }, {} as Record<string, { total: number; products: { name: string; quantity: number }[] }>);

    const salesChartData = Object.entries(salesByDate)
        .map(([date, data]) => {
            const groupedProducts = data.products.reduce((acc, curr) => {
                const existing = acc.find(item => item.name === curr.name);
                if (existing) {
                    existing.quantity += curr.quantity;
                } else {
                    acc.push({ name: curr.name, quantity: curr.quantity });
                }
                return acc;
            }, [] as {name: string, quantity: number}[]);

            return {
                date,
                sales: data.total,
                productsSold: groupedProducts
            }
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const topSellingProducts: Record<string, number> = sales.reduce((acc, sale) => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            acc[product.name] = (acc[product.name] || 0) + sale.quantity;
        }
        return acc;
    }, {} as Record<string, number>);

    const topSellingChartData = Object.entries(topSellingProducts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, quantity]) => ({ name: name.replace(/ \(.+\)/, ''), quantity }));

    // --- Sales by Day of the Week Data ---
    const salesByDayOfWeek = sales.reduce((acc, sale) => {
        const dayIndex = new Date(sale.saleDate).getDay(); // 0 for Sunday, 1 for Monday, etc.
        acc[dayIndex] = (acc[dayIndex] || 0) + sale.quantity;
        return acc;
    }, [] as number[]);

    const dayOfWeekData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => ({
        name: day,
        "Units Sold": salesByDayOfWeek[index] || 0,
    }));


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Sales This Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklySalesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="day" fontSize={12} tick={{ fill: '#64748b' }} />
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip content={<CustomTooltipWithProducts />} cursor={{fill: '#f1f5f9'}} />
              <Legend />
              <Bar dataKey="sales" name="Units Sold" fill="#3b82f6" barSize={30} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Overview Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Inventory Overview</h3>
           <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={inventoryPieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {inventoryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Sales Over Time</h3>
           <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" fontSize={12} tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} tick={{ fill: '#64748b' }}/>
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip content={<CustomTooltipWithProducts />} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 8 }} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Top 5 Selling Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Top 5 Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellingChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis type="number" hide/>
              <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }}/>
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }}/>
              <Bar dataKey="quantity" fill="#FDB813" name="Units Sold" barSize={20} radius={[0, 4, 4, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock Levels Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
        <h3 className="font-bold text-slate-800 text-lg mb-4">Top 10 Products by Stock Level</h3>
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stockData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                <XAxis type="number" tick={{ fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={150} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }}/>
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }}/>
                <Bar dataKey="stock" fill="#14b8a6" name="Units in Stock" barSize={20} radius={[0, 4, 4, 0]}/>
            </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sales by Day of Week Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-bold text-slate-800 text-lg mb-4">Sales Performance by Day of the Week</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayOfWeekData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '0.5rem' }}/>
                <Legend />
                <Bar dataKey="Units Sold" fill="#f97316" barSize={40} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Reports;