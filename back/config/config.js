require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const config = {
  // Server configuration
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  
  // Database configuration
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  
  // File upload configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadPath: 'src/assets/uploads/'
  }
};

module.exports = config;
