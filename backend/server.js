const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Product, Sale, User } = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- SECURITY & VALIDATION HELPERS ---

// Basic HTML sanitization to prevent stored XSS
const sanitize = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
};

const isValidUsername = (username) => {
  // Alphanumeric and underscores only, min 3 chars
  return typeof username === 'string' && /^[a-zA-Z0-9_]{3,}$/.test(username);
};

const isValidPassword = (password) => {
  // Min 6 chars
  return typeof password === 'string' && password.length >= 6;
};

// --- AUTH API ---

// Login
app.post('/api/login', async (req, res) => {
  let { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Sanitize inputs
  username = sanitize(username);
  
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ message: "success", data: user });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USERS API ---

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a user
app.post('/api/users', async (req, res) => {
  let { username, password, fullName, role } = req.body;

  // Validation
  if (!isValidUsername(username)) {
    return res.status(400).json({ error: "Username must be at least 3 characters and alphanumeric." });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }
  if (!fullName || typeof fullName !== 'string') {
    return res.status(400).json({ error: "Full Name is required." });
  }
  if (!['admin', 'staff'].includes(role)) {
    return res.status(400).json({ error: "Invalid role specified." });
  }

  // Sanitize
  username = sanitize(username);
  fullName = sanitize(fullName);

  try {
    // Check if username exists
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = new User({ username, password, fullName, role });
    const savedUser = await newUser.save();
    res.json({ message: "success", data: savedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a user
app.put('/api/users/:id', async (req, res) => {
  let { username, password, fullName, role } = req.body;
  const userId = req.params.id;

  // Validation
  if (username && !isValidUsername(username)) {
    return res.status(400).json({ error: "Invalid username format." });
  }
  if (password && password.trim() !== "" && !isValidPassword(password)) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }
  if (role && !['admin', 'staff'].includes(role)) {
    return res.status(400).json({ error: "Invalid role." });
  }

  // Sanitize
  if (username) username = sanitize(username);
  if (fullName) fullName = sanitize(fullName);

  try {
    // Check if username is taken by another user
    if (username) {
        const existing = await User.findOne({ username, _id: { $ne: userId } });
        if (existing) {
          return res.status(400).json({ error: "Username already exists" });
        }
    }

    const updateData = { role };
    if (username) updateData.username = username;
    if (fullName) updateData.fullName = fullName;
    
    // Only update password if a new one is provided and not empty
    if (password && password.trim() !== "") {
      updateData.password = password; 
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "success", data: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// --- PRODUCTS API ---

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 });
    res.json({ data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new product
app.post('/api/products', async (req, res) => {
  let { name, category, price, stock, imageUrl } = req.body;

  // Validation
  if (!name || typeof name !== 'string') return res.status(400).json({ error: "Product name is required" });
  if (!category || typeof category !== 'string') return res.status(400).json({ error: "Category is required" });
  if (typeof price !== 'number' || price < 0) return res.status(400).json({ error: "Price must be a positive number" });
  if (typeof stock !== 'number' || stock < 0) return res.status(400).json({ error: "Stock cannot be negative" });

  // Sanitize
  name = sanitize(name);
  category = sanitize(category);
  // We don't strictly sanitize imageUrl but could validate it is a URL format

  try {
    const newProduct = new Product({ name, category, price, stock, imageUrl });
    const savedProduct = await newProduct.save();
    res.json({ message: "success", data: savedProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
  let { name, category, price, stock, imageUrl } = req.body;

  // Validation (if fields are present)
  if (price !== undefined && (typeof price !== 'number' || price < 0)) return res.status(400).json({ error: "Invalid price" });
  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) return res.status(400).json({ error: "Invalid stock" });

  if (name) name = sanitize(name);
  if (category) category = sanitize(category);

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      { name, category, price, stock, imageUrl }, 
      { new: true }
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
  const { quantity } = req.body;
  
  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be a positive number" });
  }

  try {
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

// Record a Sale
app.post('/api/sales', async (req, res) => {
  const { productId, quantity, saleDate } = req.body;

  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be a positive number" });
  }

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

// --- SERVE FRONTEND (Production) ---
// We check for 'dist' (Vite default) or 'build' (CRA default)
// We check both the parent directory and a 'frontend' sibling directory
const possibleDistPaths = [
  path.join(__dirname, '../dist'),             // Root (if files are mixed)
  path.join(__dirname, '../frontend/dist'),    // Standard Monorepo structure
  path.join(__dirname, '../frontend/build'),   // CRA structure
  path.join(__dirname, '../client/dist')       // Alternative naming
];

let distPath = null;
for (const p of possibleDistPaths) {
  if (fs.existsSync(p)) {
    distPath = p;
    break;
  }
}

if (distPath) {
  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('No frontend build found. API is running, but static files are not served.');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});