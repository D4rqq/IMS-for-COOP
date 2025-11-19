const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a file-based database
const dbPath = path.resolve(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath, err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // 1. Create Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      imageUrl TEXT
    )`);

    // 2. Create Sales Table
    db.run(`CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      saleDate TEXT NOT NULL,
      FOREIGN KEY(productId) REFERENCES products(id)
    )`);

    // 3. Seed Data if Empty
    db.get("SELECT count(*) as count FROM products", (err, row) => {
      if (row.count === 0) {
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

        const stmt = db.prepare("INSERT INTO products (name, category, price, stock, imageUrl) VALUES (?, ?, ?, ?, ?)");
        products.forEach(p => {
          stmt.run(p.name, p.category, p.price, p.stock, p.imageUrl);
        });
        stmt.finalize();
        console.log("Products seeded.");

        // Generate dummy sales
        const saleStmt = db.prepare("INSERT INTO sales (productId, quantity, saleDate) VALUES (?, ?, ?)");
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const salesPerDay = Math.floor(Math.random() * 5) + 1;
          
          for (let j = 0; j < salesPerDay; j++) {
            // Random product ID between 1 and 10 (assuming auto-increment starts at 1)
            const pid = Math.floor(Math.random() * 10) + 1;
            const qty = Math.floor(Math.random() * 3) + 1;
            saleStmt.run(pid, qty, dateStr);
          }
        }
        saleStmt.finalize();
        console.log("Sales seeded.");
      }
    });
  });
}

module.exports = db;
