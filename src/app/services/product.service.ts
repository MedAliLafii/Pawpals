import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Product, Category, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = import.meta.env.BACK_URL;

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
        catchError((error) => {
          console.warn('API not available, returning empty array:', error);
          // Return empty array instead of throwing error to prevent app crash
          return [];
        })
      );
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/produit/${id}`)
      .pipe(
        catchError((error) => {
          console.warn('API not available for product details:', error);
          return [];
        })
      );
  }

  // Get product specifications
  getProductSpecifications(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fiche-technique/${id}`)
      .pipe(
        catchError((error) => {
          console.warn('API not available for product specifications:', error);
          return [];
        })
      );
  }

  // Get all categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categorie`)
      .pipe(
        catchError((error) => {
          console.warn('API not available for categories:', error);
          return [];
        })
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
        catchError((error) => {
          console.warn('API not available for search:', error);
          return [];
        })
      );
  }

  // Get featured products
  getFeaturedProducts(limit: number = 6): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/produit/featured?limit=${limit}`)
      .pipe(
        map(response => response.data!),
        catchError((error) => {
          console.warn('API not available for featured products:', error);
          return [];
        })
      );
  }


}