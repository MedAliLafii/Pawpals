const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require('path');

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

// Check if environment variables are set
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  
  // Add a health check endpoint that shows the missing variables
  app.get("/health", (req, res) => {
    res.status(500).json({ 
      error: "Server not configured properly",
      missing: missingEnvVars,
      message: "Please set up the required environment variables in Vercel"
    });
  });
  
  // Add a simple test endpoint
  app.get("/test", (req, res) => {
    res.status(200).json({ 
      message: "API is running but database is not configured",
      missing: missingEnvVars
    });
  });
  
  // Export for Vercel
  module.exports = app;
  return;
}

// Import configuration and database only if environment variables are set
let config, pool, clientRoutes, cartRoutes, adoptPetRoutes, lostPetRoutes;

try {
  config = require('../back/config/config');
  pool = require('../back/config/database');
  clientRoutes = require("../back/client.js");
  cartRoutes = require("../back/cart.js");
  adoptPetRoutes = require('../back/adoptPet');
  lostPetRoutes = require('../back/lostPet');
} catch (error) {
  console.error('Error loading backend modules:', error);
  
  app.get("/health", (req, res) => {
    res.status(500).json({ 
      error: "Failed to load backend modules",
      message: error.message
    });
  });
  
  module.exports = app;
  return;
}

// Middleware to attach the MySQL pool to each request
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test endpoint that doesn't require database
app.get("/test", (req, res) => {
  res.status(200).json({ 
    message: "API test endpoint is working",
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
      DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
      DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET'
    }
  });
});

// GET route to fetch all categories
app.get("/categorie", (req, res) => {
  try {
    pool.query(`SELECT * FROM Categorie`, (err, results) => {
      if (err) {
        console.error("Error fetching categories:", err);
        return res.status(500).json({ error: "Database request failed", details: err.message });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Unexpected error in categories endpoint:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// GET route to fetch product details by ID
app.get("/produit/:id", (req, res) => {
  try {
    const productId = req.params.id;

    const sql = `SELECT produit.*, Categorie.nom AS nomCat
               FROM produit
               LEFT JOIN Categorie ON produit.categorieID = Categorie.categorieID
               WHERE produitID = ?`;

    pool.query(sql, [productId], (err, results) => {
      if (err) {
        console.error("Error fetching product:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    console.error("Unexpected error in product endpoint:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// GET route to fetch products with optional filters
app.get('/produit', (req, res) => {
  try {
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
        return res.status(500).json({ error: 'Failed to fetch products', details: err.message });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Unexpected error in products endpoint:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Register custom routes
try {
  app.use("/Client", clientRoutes); 
  app.use("/Cart", cartRoutes); 
  app.use('/adoptPet', adoptPetRoutes);
  app.use('/lostPet', lostPetRoutes);
} catch (error) {
  console.error("Error registering routes:", error);
}

// Serve static files
try {
  app.use('/assets/uploads', express.static(path.join(__dirname, '../back/assets/uploads')));
  app.use('/assets/uploadslost', express.static(path.join(__dirname, '../back/assets/uploadslost')));
} catch (error) {
  console.error("Error setting up static files:", error);
}

// Export for Vercel
module.exports = app;
