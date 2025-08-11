import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product, Category } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  // Static categories data
  private categories: Category[] = [
    { categorieID: 1, nom: 'Food', description: 'Pet food and treats' },
    { categorieID: 2, nom: 'Toys', description: 'Pet toys and entertainment' },
    { categorieID: 3, nom: 'Health', description: 'Pet health and wellness products' },
    { categorieID: 4, nom: 'Accessories', description: 'Pet accessories and equipment' },
    { categorieID: 5, nom: 'Grooming', description: 'Pet grooming supplies' },
    { categorieID: 6, nom: 'Beds', description: 'Comfortable pet beds and furniture' }
  ];

  // Static products data
  private products: Product[] = [
    {
      produitID: 1,
      nom: 'Premium Dog Food',
      nomCat: 'Food',
      description: 'High-quality dog food made with real meat and vegetables. Perfect for all breeds and ages.',
      prix: 29.99,
      oldPrice: 34.99,
      stock: 100,
      imageURL: 'https://images.unsplash.com/photo-1601758228041-3caa53d83420?w=400',
      categorieID: 1,
      rating: 4.5
    },
    {
      produitID: 2,
      nom: 'Cat Toy Set',
      nomCat: 'Toys',
      description: 'Interactive toys for cats including balls, feathers, and laser pointers.',
      prix: 15.99,
      oldPrice: 19.99,
      stock: 50,
      imageURL: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
      categorieID: 2,
      rating: 4.2
    },
    {
      produitID: 3,
      nom: 'Pet Vitamins',
      nomCat: 'Health',
      description: 'Essential vitamins and supplements for pets to maintain optimal health.',
      prix: 19.99,
      oldPrice: 24.99,
      stock: 75,
      imageURL: 'https://images.unsplash.com/photo-1587764379873-97837921fd44?w=400',
      categorieID: 3,
      rating: 4.7
    },
    {
      produitID: 4,
      nom: 'Pet Collar',
      nomCat: 'Accessories',
      description: 'Comfortable and durable pet collar with adjustable size and reflective strip.',
      prix: 12.99,
      oldPrice: 15.99,
      stock: 80,
      imageURL: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
      categorieID: 4,
      rating: 4.3
    },
    {
      produitID: 5,
      nom: 'Grooming Brush',
      nomCat: 'Grooming',
      description: 'Professional grooming brush for dogs and cats with soft bristles.',
      prix: 8.99,
      oldPrice: 11.99,
      stock: 60,
      imageURL: 'https://images.unsplash.com/photo-1601758228041-3caa53d83420?w=400',
      categorieID: 5,
      rating: 4.1
    },
    {
      produitID: 6,
      nom: 'Pet Bed',
      nomCat: 'Beds',
      description: 'Comfortable and washable pet bed with memory foam padding.',
      prix: 34.99,
      oldPrice: 39.99,
      stock: 40,
      imageURL: 'https://images.unsplash.com/photo-1587764379873-97837921fd44?w=400',
      categorieID: 6,
      rating: 4.6
    },
    {
      produitID: 7,
      nom: 'Cat Food',
      nomCat: 'Food',
      description: 'Premium cat food with balanced nutrition for all life stages.',
      prix: 24.99,
      oldPrice: 29.99,
      stock: 90,
      imageURL: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
      categorieID: 1,
      rating: 4.4
    },
    {
      produitID: 8,
      nom: 'Dog Leash',
      nomCat: 'Accessories',
      description: 'Strong and comfortable dog leash with padded handle.',
      prix: 16.99,
      oldPrice: 19.99,
      stock: 70,
      imageURL: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
      categorieID: 4,
      rating: 4.0
    },
    {
      produitID: 9,
      nom: 'Pet Shampoo',
      nomCat: 'Grooming',
      description: 'Gentle pet shampoo with natural ingredients for sensitive skin.',
      prix: 11.99,
      oldPrice: 14.99,
      stock: 55,
      imageURL: 'https://images.unsplash.com/photo-1601758228041-3caa53d83420?w=400',
      categorieID: 5,
      rating: 4.3
    },
    {
      produitID: 10,
      nom: 'Bird Toys',
      nomCat: 'Toys',
      description: 'Colorful and safe toys for birds to keep them entertained.',
      prix: 9.99,
      oldPrice: 12.99,
      stock: 45,
      imageURL: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
      categorieID: 2,
      rating: 4.1
    },
    {
      produitID: 11,
      nom: 'Fish Food',
      nomCat: 'Food',
      description: 'Nutritious fish food flakes for tropical and goldfish.',
      prix: 6.99,
      oldPrice: 8.99,
      stock: 120,
      imageURL: 'https://images.unsplash.com/photo-1587764379873-97837921fd44?w=400',
      categorieID: 1,
      rating: 4.0
    },
    {
      produitID: 12,
      nom: 'Pet Carrier',
      nomCat: 'Accessories',
      description: 'Comfortable and secure pet carrier for travel and vet visits.',
      prix: 39.99,
      oldPrice: 49.99,
      stock: 30,
      imageURL: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
      categorieID: 4,
      rating: 4.8
    }
  ];

  constructor() {}

  // Get products with optional filters
  getProducts(categoryID?: number, maxPrice?: number, page: number = 1, limit: number = 12): Observable<Product[]> {
    let filteredProducts = [...this.products];
    
    if (categoryID !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.categorieID === categoryID);
    }
    
    if (maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.prix <= maxPrice);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return of(paginatedProducts);
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    const product = this.products.find(p => p.produitID === id);
    return of(product!);
  }

  // Get product specifications (static data)
  getProductSpecifications(id: number): Observable<any[]> {
    const specs = [
      { name: 'Material', value: 'High-quality materials' },
      { name: 'Size', value: 'One size fits most' },
      { name: 'Warranty', value: '1 year warranty' },
      { name: 'Care Instructions', value: 'Hand wash recommended' }
    ];
    return of(specs);
  }

  // Get all categories
  getCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  // Search products
  searchProducts(query: string, categoryID?: number): Observable<Product[]> {
    let filteredProducts = this.products.filter(product => 
      product.nom.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
    
    if (categoryID !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.categorieID === categoryID);
    }

    return of(filteredProducts);
  }

  // Get featured products
  getFeaturedProducts(limit: number = 6): Observable<Product[]> {
    const featured = this.products.slice(0, limit);
    return of(featured);
  }
}