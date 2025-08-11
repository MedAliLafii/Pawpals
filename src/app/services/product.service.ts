import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product, Category, ApiResponse, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  // Get products with optional filters (maintains backward compatibility)
  getProducts(categoryID?: number, maxPrice?: number, page: number = 1, limit: number = 12): Observable<Product[]> {
    let params = new HttpParams();
    
    if (categoryID !== undefined) {
      params = params.set('categoryID', categoryID.toString());
    }
    
    if (maxPrice !== undefined) {
      params = params.set('maxPrice', maxPrice.toString());
    }

    return this.http.get<Product[]>(`${this.apiUrl}/produit`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/produit/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get product specifications
  getProductSpecifications(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fiche-technique/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get all categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categorie`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Search products
  searchProducts(query: string, categoryID?: number): Observable<Product[]> {
    let params = new HttpParams().set('q', query);
    
    if (categoryID !== undefined) {
      params = params.set('categoryID', categoryID.toString());
    }

    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/produit/search`, { params })
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  // Get featured products
  getFeaturedProducts(limit: number = 6): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/produit/featured?limit=${limit}`)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('Product service error:', error);
    return throwError(() => new Error(error.message || 'An error occurred while fetching products'));
  }
}