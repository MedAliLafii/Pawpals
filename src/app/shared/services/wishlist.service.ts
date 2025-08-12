import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistItems = new BehaviorSubject<Product[]>([]);
  private readonly apiUrl = `${import.meta.env.BACK_URL}/wishlist`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {
    this.loadWishlist();
  }

  getWishlist(): Observable<Product[]> {
    return this.wishlistItems.asObservable();
  }

  addToWishlist(product: Product): void {
    this.http.post(`${this.apiUrl}/add`, { produitID: product.produitID }, { withCredentials: true })
      .subscribe({
        next: () => {
          const currentItems = this.wishlistItems.value;
          if (!currentItems.find(item => item.produitID === product.produitID)) {
            this.wishlistItems.next([...currentItems, product]);
            this.toastService.success(`${product.nom} added to wishlist!`);
          }
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          this.toastService.error('Failed to add to wishlist');
        }
      });
  }

  removeFromWishlist(productId: number): void {
    this.http.delete(`${this.apiUrl}/remove/${productId}`, { withCredentials: true })
      .subscribe({
        next: () => {
          const currentItems = this.wishlistItems.value;
          const updatedItems = currentItems.filter(item => item.produitID !== productId);
          this.wishlistItems.next(updatedItems);
          this.toastService.success('Item removed from wishlist');
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
          this.toastService.error('Failed to remove from wishlist');
        }
      });
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistItems.value.some(item => item.produitID === productId);
  }

  getWishlistCount(): number {
    return this.wishlistItems.value.length;
  }

  private loadWishlist(): void {
    this.http.get<Product[]>(`${this.apiUrl}`, { withCredentials: true })
      .subscribe({
        next: (items) => {
          this.wishlistItems.next(items);
        },
        error: (error) => {
          console.error('Error loading wishlist:', error);
        }
      });
  }
}
