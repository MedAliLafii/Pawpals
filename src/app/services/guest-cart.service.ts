import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models';

export interface GuestCartItem {
  produitID: number;
  nom: string;
  prix: number;
  imageURL: string;
  quantite: number;
}

@Injectable({
  providedIn: 'root'
})
export class GuestCartService {
  private cartItems = new BehaviorSubject<GuestCartItem[]>([]);
  private readonly CART_KEY = 'guest_cart';

  constructor() {
    this.loadCartFromStorage();
  }

  getCartItems(): Observable<GuestCartItem[]> {
    return this.cartItems.asObservable();
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.produitID === product.produitID);

    if (existingItem) {
      existingItem.quantite += quantity;
    } else {
      currentItems.push({
        produitID: product.produitID,
        nom: product.nom,
        prix: product.prix,
        imageURL: product.imageURL,
        quantite: quantity
      });
    }

    this.updateCart(currentItems);
  }

  removeFromCart(productId: number): void {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => item.produitID !== productId);
    this.updateCart(updatedItems);
  }

  updateQuantity(productId: number, quantity: number): void {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(item => item.produitID === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantite = quantity;
        this.updateCart(currentItems);
      }
    }
  }

  clearCart(): void {
    this.updateCart([]);
  }

  getCartCount(): number {
    return this.cartItems.value.reduce((total, item) => total + item.quantite, 0);
  }

  getCartTotal(): number {
    return this.cartItems.value.reduce((total, item) => total + (item.prix * item.quantite), 0);
  }

  private updateCart(items: GuestCartItem[]): void {
    this.cartItems.next(items);
    this.saveCartToStorage();
  }

  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem(this.CART_KEY);
      if (storedCart) {
        const items = JSON.parse(storedCart);
        this.cartItems.next(items);
      }
    } catch (error) {
      console.error('Error loading guest cart from storage:', error);
      this.cartItems.next([]);
    }
  }

  private saveCartToStorage(): void {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(this.cartItems.value));
    } catch (error) {
      console.error('Error saving guest cart to storage:', error);
    }
  }

  // Convert guest cart to server format when user logs in
  convertToServerCart(): any[] {
    return this.cartItems.value.map(item => ({
      produitID: item.produitID,
      quantite: item.quantite
    }));
  }
}
