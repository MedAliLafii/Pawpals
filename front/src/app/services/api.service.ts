import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Updated to use Angular environment configuration
  private readonly baseUrl = environment.BACK_URL;

  constructor(private http: HttpClient) {
    console.log('API Service initialized with baseUrl:', this.baseUrl);
  }

  // Client endpoints
  checkAuth(): Observable<{client: any}> {
    return this.http.get<{client: any}>(`${this.baseUrl}/Client/checkAuth`, { withCredentials: true });
  }

  loginClient(loginData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Client/loginClient`, loginData, { withCredentials: true });
  }

  registerClient(formData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Client/registerClient`, formData, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/Client/logout`, {}, { withCredentials: true });
  }

  getClientInfo(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Client/getClientInfo`, { withCredentials: true });
  }

  updateClientInfo(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/Client/updateClientInfo`, data, { withCredentials: true });
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Client/account`, { withCredentials: true });
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Client/changePassword`, data, { withCredentials: true });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Client/forgotpassword`, { email }, { withCredentials: true });
  }

  changePass(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Client/changepass`, data, { withCredentials: true });
  }

  // Cart endpoints
  getCart(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Cart`, { withCredentials: true });
  }

  fetchCart(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Cart/fetch`, { withCredentials: true });
  }

  addToCart(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Cart/add`, data, { withCredentials: true });
  }

  updateCart(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/Cart/update`, data, { withCredentials: true });
  }

  removeFromCart(data: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Cart/remove`, { body: data, withCredentials: true });
  }

  commander(): Observable<any> {
    return this.http.post(`${this.baseUrl}/Cart/commander`, {}, { withCredentials: true });
  }

  // Product endpoints
  getProducts(categoryID?: number, maxPrice?: number): Observable<any[]> {
    let params = '';
    if (categoryID) params += `categoryID=${categoryID}`;
    if (maxPrice) params += `${params ? '&' : ''}maxPrice=${maxPrice}`;
    return this.http.get<any[]>(`${this.baseUrl}/produit${params ? '?' + params : ''}`);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/produit/${id}`);
  }

  // Category endpoints
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categorie`);
  }

  // Adoption endpoints
  getAdoptionPets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/adoptPet/`);
  }

  getAdoptionPetsWithFilters(params: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/adoptPet/pets?${params}`);
  }

  addAdoptionPet(formData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/adoptPet/add`, formData, { withCredentials: true });
  }

  deleteAdoptionPet(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/adoptPet/delete/${id}`, { withCredentials: true });
  }

  // Lost pet endpoints
  getAllLostPets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lostPet/all`);
  }

  getLostPetsWithFilters(params: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lostPet/pets?${params}`);
  }

  getLostPets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lostPet/lost`);
  }

  addLostPet(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/lostpet/add`, data, { withCredentials: true });
  }

  deleteLostPet(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/lostPet/delete/${id}`, { withCredentials: true });
  }

  // Review endpoints
  addReview(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reviews`, data, { withCredentials: true });
  }

  getReviews(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reviews/${productId}`);
  }

  // Wishlist endpoints
  getWishlist(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/wishlist`);
  }
}
