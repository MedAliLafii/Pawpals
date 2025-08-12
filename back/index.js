// Importing required modules
const express = require("express"); // Framework to create web applications
const cors = require("cors"); // Middleware to handle CORS
const bodyParser = require("body-parser"); // Middleware to parse JSON request bodies
const cookieParser = require("cookie-parser"); // Middleware to handle cookies
const path = require('path');

// Import configuration
const config = require('./config/config');
const pool = require('./config/database');

// Importing custom routes
const clientRoutes = require("./client.js"); // Routes related to clients
const cartRoutes = require("./cart.js"); // Routes related to the cart
const adoptPetRoutes = require('./adoptPet');
const lostPetRoutes = require('./lostPet');

// Creating the Express app
const app = express();

// Enable middleware to read cookies
app.use(cookieParser());

// Enable middleware to read JSON from requests
app.use(bodyParser.json());

// CORS configuration
app.use(cors(config.cors));

// Middleware to attach the MySQL pool to each request
app.use((req, res, next) => {
  req.pool = pool; // Add the pool to the `req` object
  next(); // Continue to the next middleware
});

// Root route handler with environment debugging
app.get("/", (req, res) => {
  console.log("Environment variables check:");
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_PORT:", process.env.DB_PORT);
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
  console.log("DB_NAME:", process.env.DB_NAME);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);
  
  res.status(200).json({ 
    message: "Pawpals API is running", 
    version: "1.0.0",
    endpoints: {
      categories: "/categorie",
      products: "/produit",
      clients: "/Client",
      cart: "/Cart",
      adoption: "/adoptPet",
      lostPets: "/lostPet"
    },
    envCheck: {
      dbHost: process.env.DB_HOST,
      dbPort: process.env.DB_PORT,
      dbUser: process.env.DB_USER,
      dbPassword: process.env.DB_PASSWORD,
      dbName: process.env.DB_NAME,
      jwtSecret: process.env.JWT_SECRET,
      corsOrigin: process.env.CORS_ORIGIN
    }
  });
});

// GET route to fetch all categories with enhanced error logging
app.get("/categorie", (req, res) => {
  console.log("Attempting to fetch categories...");
  pool.query(`SELECT * FROM Categorie`, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Error sqlMessage:", err.sqlMessage);
      return res.status(500).json({ 
        error: "Database request failed",
        details: {
          code: err.code,
          message: err.message,
          sqlMessage: err.sqlMessage
        }
      });
    } else {
      console.log("Categories fetched successfully, count:", results.length);
      res.status(200).json(results); // Return the list of categories
    }
  });
});

// GET route to fetch product details by ID
app.get("/produit/:id", (req, res) => {
  const productId = req.params.id; // Get product ID from URL parameters

  // SQL query to fetch product info and its category name
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
    res.status(200).json(results[0]); // Return the found product
  });
});


// GET route to fetch products with optional filters (category, max price)
app.get('/produit', (req, res) => {
  const categoryID = req.query.categoryID; // Get category from query params
  const maxPrice = req.query.maxPrice; // Get max price from query params

  let query = 'SELECT * FROM produit WHERE 1=1'; // Base query (always true)
  const params = []; // Parameters for prepared statement

  // If category is specified, add it to the query
  if (categoryID) {
    query += ' AND categorieID = ?';
    params.push(categoryID);
  }

  // If max price is specified, add it to the query
  if (maxPrice) {
    query += ' AND prix <= ?';
    params.push(maxPrice);
  }
  
  // Execute the query with parameters
  pool.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.status(200).json(results); // Return the found products
  });
});

// Register custom routes for client and cart
app.use("/Client", clientRoutes); 
app.use("/Cart", cartRoutes); 
app.use('/adoptPet', adoptPetRoutes);
app.use('/lostPet', lostPetRoutes);
app.use('/assets/uploads', express.static(path.join(__dirname, 'assets', 'uploads')));  // Serve static files from back/assets/uploads

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
