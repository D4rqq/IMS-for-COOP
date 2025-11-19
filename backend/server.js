const express = require('express');
const cors = require('cors');
const { Product, Sale } = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- PRODUCTS API ---

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    // Sort by _id descending (roughly creation time)
    const products = await Product.find({}).sort({ _id: -1 });
    res.json({ data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.json({ message: "success", data: savedProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Return the updated document
    );
    res.json({ message: "success", data: updatedProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add Stock (Quick Update)
app.post('/api/products/:id/stock', async (req, res) => {
  try {
    const { quantity } = req.body;
    await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: quantity } }
    );
    res.json({ message: "success" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- SALES API ---

// Get all sales
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Sale.find({}).sort({ saleDate: -1, _id: -1 });
    res.json({ data: sales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record a Sale (Transaction: Add Sale + Decrease Stock)
app.post('/api/sales', async (req, res) => {
  const { productId, quantity, saleDate } = req.body;

  // Use a Mongoose session for transactions (requires MongoDB replica set usually, 
  // but standard logic works for single instance if careful)
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Decrease stock
    product.stock -= quantity;
    await product.save();

    // Create Sale
    const newSale = new Sale({ productId, quantity, saleDate });
    const savedSale = await newSale.save();

    res.json({ message: "success", data: savedSale });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});