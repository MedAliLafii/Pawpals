# PawPals - Pet Adoption & E-commerce Platform

A comprehensive web application that combines pet adoption services with e-commerce functionality for pet products. Built with Angular 19 and Node.js, featuring robust authentication and cross-domain cookie support.

## 🚀 Live Demo

- **Frontend**: https://pawpals.vercel.app
- **Backend API**: https://pawpalsback.vercel.app

## ✨ Features

### 🐾 Pet Services

- **Pet Adoption**: Browse and post pets for adoption with detailed profiles
- **Lost Pet Services**: Report and search for lost pets with image uploads
- **Pet Reviews**: Rate and review pet products

### 🛒 E-commerce

- **Product Catalog**: Browse pet products by categories
- **Shopping Cart**: Add, update, and manage cart items
- **Order Management**: Complete checkout process
- **Product Reviews**: Customer ratings and feedback

### 👤 User Management

- **Secure Authentication**: JWT-based login/registration with cross-domain support
- **User Profiles**: Manage personal information and preferences
- **Password Management**: Change password functionality
- **Account Deletion**: Secure account removal

### 🎨 User Experience

- **Responsive Design**: Mobile-friendly interface using Bootstrap and Tailwind CSS
- **Real-time Notifications**: Toast notifications for user feedback
- **Search Functionality**: Find products and pets easily
- **Image Upload**: Support for pet and product images

## 🛠️ Tech Stack

### Frontend

- **Angular 19** - Modern web framework with standalone components
- **Bootstrap 5** - UI components and responsive grid system
- **Tailwind CSS** - Utility-first CSS framework
- **RxJS** - Reactive programming with BehaviorSubject for state management
- **TypeScript** - Type-safe JavaScript development

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework with middleware support
- **MySQL** - Relational database with proper table naming conventions
- **JWT** - JSON Web Tokens for secure authentication
- **Multer** - File upload handling for images
- **Nodemailer** - Email functionality for notifications
- **bcrypt** - Password hashing and security

### Deployment

- **Vercel** - Frontend and backend hosting
- **MySQL Database** - Cloud-hosted database
- **Environment Variables** - Secure configuration management

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Angular CLI (v19.1.8)

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd Pawpals
```

### 2. Install dependencies

```bash
# Install frontend dependencies
cd front
npm install

# Install backend dependencies
cd ../back
npm install
cd ..
```

### 3. Database Setup

```bash
# Create and configure your MySQL database
mysql -u root -p < Pawpals.sql
```

### 4. Environment Configuration

#### Backend Environment

```bash
# Copy environment example file
cp back/config.env.example back/.env

# Configure the following variables in back/.env:
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:4200
COOKIE_DOMAIN=localhost
```

#### Frontend Environment

```bash
# Development environment (front/src/environments/environment.ts)
export const environment = {
  production: false,
  BACK_URL: 'http://localhost:5000'
};

# Production environment (front/src/environments/environment.prod.ts)
export const environment = {
  production: true,
  BACK_URL: 'https://pawpalsback.vercel.app'
};
```

### 5. Start the application

```bash
# Start backend server
cd back
npm start

# Start frontend (in a new terminal)
cd front
ng serve
```

The application will be available at:

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000

## 🔧 Development

### Available Scripts

```bash
# Backend (in back/ directory)
npm start              # Start development server
npm run dev            # Start with nodemon for development
npm run seed           # Seed database with sample data

# Frontend (in front/ directory)
ng serve               # Start development server
ng build               # Build for production
ng test                # Run unit tests
ng lint                # Run linting
```

### Project Structure

```
Pawpals/
├── back/                 # Backend Node.js/Express application
│   ├── config/          # Database and configuration files
│   ├── middleware/      # Express middleware (validation, rate limiting)
│   ├── *.js            # Route handlers and main server file
│   └── .env
├── front/               # Frontend Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── pages/         # Main page components
│   │   │   ├── services/      # Angular services
│   │   │   ├── guards/        # Route guards
│   │   │   └── models/        # TypeScript interfaces
│   │   ├── environments/      # Environment configurations
│   │   └── assets/           # Static assets
│   └── .env
└── Pawpals.sql         # Database schema and sample data
```

## 🔒 Security Features

### Authentication & Authorization

- **JWT-based authentication** with secure token management
- **Cross-domain cookie support** for production deployment
- **Password hashing** with bcrypt
- **Route guards** for protected pages
- **Centralized AuthService** for consistent authentication state

### Data Protection

- **CORS configuration** with proper origin validation
- **Input validation and sanitization** on both frontend and backend
- **Environment variable management** for sensitive data
- **Rate limiting** to prevent abuse
- **SQL injection prevention** with parameterized queries

## 📱 API Endpoints

### Authentication

- `POST /Client/loginClient` - User login
- `POST /Client/registerClient` - User registration
- `GET /Client/checkAuth` - Verify authentication status
- `POST /Client/verifyToken` - Verify JWT token from localStorage
- `POST /Client/logout` - User logout
- `PUT /Client/updateClientInfo` - Update user profile
- `DELETE /Client/account` - Delete user account

### Products & Categories

- `GET /produit` - Get all products
- `GET /produit/:id` - Get product by ID
- `GET /categorie` - Get all categories
- `POST /reviews` - Submit product review
- `GET /reviews/:productId` - Get product reviews

### Cart & Orders

- `GET /Cart` - Get user cart
- `POST /Cart/add` - Add item to cart
- `PUT /Cart/update` - Update cart item quantity
- `DELETE /Cart/remove` - Remove item from cart
- `POST /Cart/commander` - Complete order

### Pet Services

- `GET /adoptPet` - Get adoption pets
- `POST /adoptPet/add` - Post pet for adoption
- `DELETE /adoptPet/delete/:id` - Delete adoption post
- `GET /lostPet` - Get lost pets
- `POST /lostPet/add` - Report lost pet
- `DELETE /lostPet/delete/:id` - Delete lost pet post

## 🚀 Deployment

### Vercel Deployment

1. **Frontend Deployment**:

   ```bash
   cd front
   vercel --prod
   ```

2. **Backend Deployment**:

   ```bash
   cd back
   vercel --prod
   ```

3. **Environment Variables** (set in Vercel dashboard):
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET`
   - `CORS_ORIGIN=https://pawpals.vercel.app`
   - `COOKIE_DOMAIN=.vercel.app`

### Database Setup

- Use a cloud MySQL provider (e.g., PlanetScale, AWS RDS)
- Import the `Pawpals.sql` file to create tables and sample data
- Configure connection string in environment variables

## 🔧 Recent Improvements

### Authentication System

- ✅ **Centralized AuthService** - Single source of truth for authentication state
- ✅ **Cross-domain cookie support** - Works seamlessly in production
- ✅ **localStorage fallback** - Backup authentication for cross-domain scenarios
- ✅ **Consistent auth guards** - Protected routes work reliably
- ✅ **Real-time auth state** - Components react to authentication changes

### Component Updates

- ✅ **Profile management** - Loads user data from AuthService
- ✅ **Post adoption/lost pet** - Uses centralized authentication
- ✅ **Shopping cart** - Proper authentication checks
- ✅ **Header component** - Real-time cart count updates

### Database & Backend

- ✅ **Table naming consistency** - All tables use lowercase naming
- ✅ **CORS configuration** - Proper cross-origin request handling
- ✅ **Cookie management** - Secure, httpOnly cookies with proper domains

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
