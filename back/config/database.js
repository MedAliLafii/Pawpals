const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Database configuration using environment variables for Neon PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionString: process.env.DATABASE_URL, // Neon connection string
  ssl: {
    rejectUnauthorized: false // Required for Neon
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  maxUses: 7500 // Close (and replace) a connection after it has been used 7500 times
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    
    // Provide specific troubleshooting tips based on error
    if (err.code === 'ECONNREFUSED') {
      console.error('\n=== TROUBLESHOOTING TIPS ===');
      console.error('1. Check if your Neon database is running');
      console.error('2. Verify the connection string is correct');
      console.error('3. Check if your IP is whitelisted in Neon settings');
      console.error('4. Verify the database credentials');
    } else if (err.code === 'ENOTFOUND') {
      console.error('\n=== DNS RESOLUTION ERROR ===');
      console.error('1. Check if the database host is correct');
      console.error('2. Verify your internet connection');
    }
    return;
  }
  console.log('✅ Database connected successfully');
  release();
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'ECONNRESET') {
    console.log('Database connection was reset. Reconnecting...');
  } else {
    throw err;
  }
});

module.exports = pool;