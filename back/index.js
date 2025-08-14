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

// Middleware to attach the PostgreSQL pool to each request
app.use((req, res, next) => {
  req.pool = pool; // Add the pool to the `req` object
  next(); // Continue to the next middleware
});

// Root route handler with environment debugging
app.get("/", (req, res) => {
  console.log("Environment variables check:");
  console.log("DB_HOST:", process.env.DB_HOST ? "Set" : "Not set");
  console.log("DB_PORT:", process.env.DB_PORT ? "Set" : "Not set");
  console.log("DB_USER:", process.env.DB_USER ? "Set" : "Not set");
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "Set" : "Not set");
  console.log("DB_NAME:", process.env.DB_NAME ? "Set" : "Not set");
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
  console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN ? "Set" : "Not set");
  
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
    }
  });
});

// GET route to fetch all categories with enhanced error logging
app.get("/categorie", (req, res) => {
  console.log("Attempting to fetch categories...");
  pool.query(`SELECT categorieid AS "categorieID", nom, description FROM categorie`, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      return res.status(500).json({ 
        error: "Database request failed",
        details: {
          code: err.code,
          message: err.message
        }
      });
    } else {
      console.log("Categories fetched successfully, count:", results.rows.length);
      res.status(200).json(results.rows); // Return the list of categories
    }
  });
});

// GET route to fetch product details by ID
app.get("/produit/:id", (req, res) => {
  const productId = req.params.id; // Get product ID from URL parameters

  // SQL query to fetch product info and its category name
  const sql = `SELECT produit.produitid AS "produitID", produit.nom, produit.description, produit.prix, produit.stock, produit.imageurl AS "imageURL", produit.rating, categorie.nom AS nomCat
             FROM produit
             LEFT JOIN categorie ON produit.categorieid = categorie.categorieid
             WHERE produit.produitid = $1`;

  pool.query(sql, [productId], (err, results) => {
    if (err) {
      console.error("Error fetching product:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(results.rows[0]); // Return the found product
  });
});

// GET route to fetch products with optional filters (category, max price)
app.get('/produit', (req, res) => {
  const categoryID = req.query.categoryID; // Get category from query params
  const maxPrice = req.query.maxPrice; // Get max price from query params

  let query = 'SELECT produitid AS "produitID", nom, description, prix, stock, imageurl AS "imageURL", rating, categorieid AS "categorieID" FROM produit WHERE 1=1'; // Base query (always true)
  const params = []; // Parameters for prepared statement
  let paramCount = 0;

  // If category is specified, add it to the query
  if (categoryID) {
    paramCount++;
    query += ` AND categorieid = $${paramCount}`;
    params.push(categoryID);
  }

  // If max price is specified, add it to the query
  if (maxPrice) {
    paramCount++;
    query += ` AND prix <= $${paramCount}`;
    params.push(maxPrice);
  }
  
  // Execute the query with parameters
  pool.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.status(200).json(results.rows); // Return the found products
  });
});

// Register custom routes for client and cart
app.use("/Client", clientRoutes); 
app.use("/Cart", cartRoutes); 
app.use('/adoptPet', adoptPetRoutes);
app.use('/lostPet', lostPetRoutes);
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'src', 'assets', 'uploads')));

// Start the server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
