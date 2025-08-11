# PawPals - Pet Adoption & E-commerce Platform

A comprehensive web application that combines pet adoption services with e-commerce functionality for pet products. Built with Angular 19 and Node.js.

## 🚀 Features

- **Pet Adoption**: Browse and post pets for adoption
- **Lost Pet Services**: Report and search for lost pets
- **E-commerce**: Shop for pet products with cart functionality
- **User Authentication**: Secure login/registration system
- **Responsive Design**: Mobile-friendly interface using Bootstrap and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Angular 19** - Modern web framework
- **Bootstrap 5** - UI components and styling
- **Tailwind CSS** - Utility-first CSS framework
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe JavaScript

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Nodemailer** - Email functionality

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Angular CLI (v19.1.8)

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd site
```

### 2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd back
npm install
cd ..
```

### 3. Database Setup
```bash
# Create and configure your MySQL database
mysql -u root -p < Pawpals.sql
```

### 4. Environment Configuration
```bash
# Copy environment example file
cp back/config.env.example back/.env

# Edit the .env file with your database credentials
# and other configuration settings
```

### 5. Start the application
```bash
# Start both frontend and backend concurrently
npm start

# Or start them separately:
# Backend: npm run server
# Frontend: npm run client
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000

## 📁 Project Structure

```
site/
├── src/app/                 # Angular application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── models/            # TypeScript interfaces
│   └── interceptors/      # HTTP interceptors
├── back/                  # Node.js backend
│   ├── config/           # Configuration files
│   ├── routes/           # API routes
│   └── middleware/       # Express middleware
├── public/               # Static assets
└── assets/              # Images and uploads
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm start              # Start both frontend and backend
npm run server         # Start backend only
npm run client         # Start frontend only

# Building
npm run build          # Build for production
npm run watch          # Watch mode for development

# Testing
npm test               # Run unit tests
```

### Code Generation

```bash
# Generate new component
ng generate component component-name

# Generate new service
ng generate service service-name

# Generate new pipe
ng generate pipe pipe-name
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Environment variable management

## 📱 API Endpoints

### Authentication
- `POST /client/login` - User login
- `POST /client/register` - User registration
- `GET /client/checkAuth` - Verify authentication

### Products
- `GET /produit` - Get all products
- `GET /produit/:id` - Get product by ID
- `GET /categorie` - Get all categories

### Cart & Orders
- `GET /panier` - Get user cart
- `POST /panier/add` - Add item to cart
- `POST /commande` - Create order

### Pet Services
- `GET /adoption` - Get adoption pets
- `POST /adoption` - Post pet for adoption
- `GET /lost` - Get lost pets
- `POST /lost` - Report lost pet

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.
