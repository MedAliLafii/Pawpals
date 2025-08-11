const { body, param, query, validationResult } = require('express-validator');

// Validation rules for user registration
const registerValidation = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('motdepasse')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('tel')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('adresse')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Address must not exceed 255 characters')
];

// Validation rules for user login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('motdepasse')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for product creation
const productValidation = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('prix')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('categorieID')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
];

// Validation rules for pet adoption
const adoptionValidation = [
  body('petName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Pet name must be between 2 and 100 characters'),
  body('breed')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Breed must not exceed 100 characters'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage('Age must be between 0 and 30 years'),
  body('type')
    .optional()
    .isIn(['dog', 'cat', 'bird', 'other'])
    .withMessage('Pet type must be dog, cat, bird, or other'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
];

// Validation rules for cart operations
const cartValidation = [
  body('produitID')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('quantite')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100')
];

// Validation for URL parameters
const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

// Validation for query parameters
const searchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  query('categoryID')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  adoptionValidation,
  cartValidation,
  idParamValidation,
  searchValidation,
  handleValidationErrors
};
