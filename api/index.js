const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require('path');

// Import configuration
const config = require('../back/config/config');
const pool = require('../back/config/database');

// Importing custom routes
const clientRoutes = require("../back/client.js");
const cartRoutes = require("../back/cart.js");
const adoptPetRoutes = require('../back/adoptPet');
const lostPetRoutes = require('../back/lostPet');

// Creating the Express app
const app = express();

// Enable middleware to read cookies
app.use(cookieParser());

// Enable middleware to read JSON from requests
app.use(bodyParser.json());

// CORS configuration for Vercel
app.use(cors({
  origin: ['https://pawpals-mu.vercel.app', 'http://localhost:4200'],
  credentials: true
}));

// Middleware to attach the MySQL pool to each request
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// GET route to fetch all categories
app.get("/categorie", (req, res) => {
  pool.query(`SELECT * FROM Categorie`, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ error: "Database request failed" });
    } else {
      res.status(200).json(results);
    }
  });
});

// GET route to fetch product details by ID
app.get("/produit/:id", (req, res) => {
  const productId = req.params.id;

  const sql = `SELECT produit.*, Categorie.nom AS nomCat
             FROM produit
             LEFT JOIN Categorie ON produit.categorieID = Categorie.categorieID
             WHERE produitID = ?`;

  pool.query(sql, [productId], (err, results) => {
    if (err) {
      console.error("Error fetching product:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(results[0]);
  });
});

// GET route to fetch products with optional filters
app.get('/produit', (req, res) => {
  const categoryID = req.query.categoryID;
  const maxPrice = req.query.maxPrice;

  let query = 'SELECT * FROM produit WHERE 1=1';
  const params = [];

  if (categoryID) {
    query += ' AND categorieID = ?';
    params.push(categoryID);
  }

  if (maxPrice) {
    query += ' AND prix <= ?';
    params.push(maxPrice);
  }
  
  pool.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.status(200).json(results);
  });
});

// Register custom routes
app.use("/Client", clientRoutes); 
app.use("/Cart", cartRoutes); 
app.use('/adoptPet', adoptPetRoutes);
app.use('/lostPet', lostPetRoutes);

// Serve static files
app.use('/assets/uploads', express.static(path.join(__dirname, '../back/assets/uploads')));
app.use('/assets/uploadslost', express.static(path.join(__dirname, '../back/assets/uploadslost')));

// Export for Vercel
module.exports = app;
