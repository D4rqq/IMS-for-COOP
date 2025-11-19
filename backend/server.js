const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- PRODUCTS API ---

// Get all products
app.get('/api/products', (req, res) => {
  const sql = "SELECT * FROM products ORDER BY id DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// Add a new product
app.post('/api/products', (req, res) => {
  const { name, category, price, stock, imageUrl } = req.body;
  const sql = "INSERT INTO products (name, category, price, stock, imageUrl) VALUES (?,?,?,?,?)";
  const params = [name, category, price, stock, imageUrl];
  
  db.run(sql, params, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    // Return the created object with its new ID
    res.json({
      message: "success",
      data: { id: this.lastID, name, category, price, stock, imageUrl }
    });
  });
});

// Update a product
app.put('/api/products/:id', (req, res) => {
  const { name, category, price, stock, imageUrl } = req.body;
  const sql = `UPDATE products SET name = ?, category = ?, price = ?, stock = ?, imageUrl = ? WHERE id = ?`;
  const params = [name, category, price, stock, imageUrl, req.params.id];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: "success", data: req.body });
  });
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  const sql = 'DELETE FROM products WHERE id = ?';
  db.run(sql, req.params.id, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: "deleted", changes: this.changes });
  });
});

// Add Stock (Quick Update)
app.post('/api/products/:id/stock', (req, res) => {
  const { quantity } = req.body;
  const sql = `UPDATE products SET stock = stock + ? WHERE id = ?`;
  
  db.run(sql, [quantity, req.params.id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: "success", changes: this.changes });
  });
});

// --- SALES API ---

// Get all sales
app.get('/api/sales', (req, res) => {
  const sql = "SELECT * FROM sales ORDER BY saleDate DESC, id DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// Record a Sale (Transaction: Add Sale + Decrease Stock)
app.post('/api/sales', (req, res) => {
  const { productId, quantity, saleDate } = req.body;

  // 1. Check if enough stock exists
  db.get("SELECT stock FROM products WHERE id = ?", [productId], (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Product not found" });
    
    if (row.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // 2. Perform Transaction (Serialized for SQLite safety)
    db.serialize(() => {
      // Decrement Stock
      db.run("UPDATE products SET stock = stock - ? WHERE id = ?", [quantity, productId]);

      // Add Sale Record
      db.run(
        "INSERT INTO sales (productId, quantity, saleDate) VALUES (?, ?, ?)",
        [productId, quantity, saleDate],
        function (err) {
          if (err) return res.status(400).json({ error: err.message });
          
          res.json({
            message: "success",
            data: { id: this.lastID, productId, quantity, saleDate }
          });
        }
      );
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
