const mongoose = require('mongoose');

// Connect to MongoDB (Default local instance)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/psucoop';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// --- Schemas ---

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  imageUrl: { type: String }
});

// Transform _id to id for frontend compatibility
productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  saleDate: { type: String, required: true } // ISO String YYYY-MM-DD
});

saleSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Product = mongoose.model('Product', productSchema);
const Sale = mongoose.model('Sale', saleSchema);

// --- Seed Data ---

const seedData = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("Seeding database with initial data...");
      const products = [
        { name: 'CICS Uniform (Male)', category: 'Department Uniform', price: 850.00, stock: 45, imageUrl: 'https://picsum.photos/seed/cicsmale/200' },
        { name: 'CICS Uniform (Female)', category: 'Department Uniform', price: 900.00, stock: 32, imageUrl: 'https://picsum.photos/seed/cicsfemale/200' },
        { name: 'CBA Uniform (Male)', category: 'Department Uniform', price: 850.00, stock: 50, imageUrl: 'https://picsum.photos/seed/cbamale/200' },
        { name: 'CBA Uniform (Female)', category: 'Department Uniform', price: 900.00, stock: 60, imageUrl: 'https://picsum.photos/seed/cbafemale/200' },
        { name: 'CAS Uniform (Unisex)', category: 'Department Uniform', price: 800.00, stock: 75, imageUrl: 'https://picsum.photos/seed/cas/200' },
        { name: 'PE T-Shirt', category: 'PE Uniform', price: 350.00, stock: 150, imageUrl: 'https://picsum.photos/seed/petshirt/200' },
        { name: 'PE Jogging Pants', category: 'PE Uniform', price: 450.00, stock: 120, imageUrl: 'https://picsum.photos/seed/pepants/200' },
        { name: 'School Patch (Large)', category: 'Patches', price: 50.00, stock: 300, imageUrl: 'https://picsum.photos/seed/patchlarge/200' },
        { name: 'School Patch (Small)', category: 'Patches', price: 35.00, stock: 5, imageUrl: 'https://picsum.photos/seed/patchsmall/200' },
        { name: 'Collar Bias (per meter)', category: 'Materials', price: 25.00, stock: 500, imageUrl: 'https://picsum.photos/seed/bias/200' },
      ];

      const createdProducts = await Product.insertMany(products);
      console.log("Products seeded.");

      // Generate dummy sales
      const sales = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const salesPerDay = Math.floor(Math.random() * 5) + 1;
        
        for (let j = 0; j < salesPerDay; j++) {
          const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
          sales.push({
            productId: randomProduct._id,
            quantity: Math.floor(Math.random() * 3) + 1,
            saleDate: dateStr
          });
        }
      }
      await Sale.insertMany(sales);
      console.log("Sales seeded.");
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

seedData();

module.exports = { Product, Sale };