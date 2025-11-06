
import { Product, Sale } from '../types';

export const products: Product[] = [
  { id: 1, name: 'CICS Uniform (Male)', category: 'Department Uniform', price: 850.00, stock: 45, imageUrl: 'https://picsum.photos/seed/cicsmale/200' },
  { id: 2, name: 'CICS Uniform (Female)', category: 'Department Uniform', price: 900.00, stock: 32, imageUrl: 'https://picsum.photos/seed/cicsfemale/200' },
  { id: 3, name: 'CBA Uniform (Male)', category: 'Department Uniform', price: 850.00, stock: 50, imageUrl: 'https://picsum.photos/seed/cbamale/200' },
  { id: 4, name: 'CBA Uniform (Female)', category: 'Department Uniform', price: 900.00, stock: 60, imageUrl: 'https://picsum.photos/seed/cbafemale/200' },
  { id: 5, name: 'CAS Uniform (Unisex)', category: 'Department Uniform', price: 800.00, stock: 75, imageUrl: 'https://picsum.photos/seed/cas/200' },
  { id: 6, name: 'PE T-Shirt', category: 'PE Uniform', price: 350.00, stock: 150, imageUrl: 'https://picsum.photos/seed/petshirt/200' },
  { id: 7, name: 'PE Jogging Pants', category: 'PE Uniform', price: 450.00, stock: 120, imageUrl: 'https://picsum.photos/seed/pepants/200' },
  { id: 8, name: 'School Patch (Large)', category: 'Patches', price: 50.00, stock: 300, imageUrl: 'https://picsum.photos/seed/patchlarge/200' },
  { id: 9, name: 'School Patch (Small)', category: 'Patches', price: 35.00, stock: 5, imageUrl: 'https://picsum.photos/seed/patchsmall/200' },
  { id: 10, name: 'Collar Bias (per meter)', category: 'Materials', price: 25.00, stock: 500, imageUrl: 'https://picsum.photos/seed/bias/200' },
];

// Generate sales data for the last 30 days
const generateSales = (): Sale[] => {
  const sales: Sale[] = [];
  let saleId = 1;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const salesPerDay = Math.floor(Math.random() * 10) + 1; // 1 to 10 sales per day
    for (let j = 0; j < salesPerDay; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      sales.push({
        id: saleId++,
        productId: product.id,
        quantity: quantity,
        saleDate: date.toISOString().split('T')[0],
      });
    }
  }
  return sales;
};

export const sales: Sale[] = generateSales();
