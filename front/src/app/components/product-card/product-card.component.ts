import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { GuestCartService } from '../../services/guest-cart.service'; 

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  standalone: true,
  imports: [CommonModule,RouterModule ]
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  selectedQuantity: number = 1;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private guestCartService: GuestCartService
  ) {}

  get produitID(): string {
    return this.product?.produitID?.toString() || '';
  }

  getStarsArray(rating: number): number[] {
    return Array(Math.floor(rating || 0)).fill(0);
  }

  getEmptyStarsArray(rating: number): number[] {
    const validRating = Math.max(0, Math.min(5, Math.floor(rating || 0))); // Ensures rating is between 0 and 5
    return Array(5 - validRating).fill(0);
  }  

  ngOnInit(): void {
    // Component initialization
  }

  addToCart(): void {
    if (this.product.stock === 0) {
      this.toastService.warning('This product is out of stock!');
      return;
    }

    // Check if user is logged in
    this.http.get('http://localhost:5000/Client/checkAuth', { withCredentials: true })
      .subscribe({
        next: () => {
          // User is logged in, add to server cart
          this.http.post(
            `http://localhost:5000/Cart/add`,
            { produitID: this.produitID, quantite: this.selectedQuantity },
            { withCredentials: true }
          ).subscribe({
            next: () => {
              this.toastService.success(`${this.product.nom} added to cart!`);
            },
            error: (error) => {
              console.error('Error adding to cart:', error);
              if (error.status === 400) {
                this.toastService.error("The quantity surpasses our available stock!");
              } else {
                this.toastService.error("Error adding to cart");
              }
            }
          });
        },
        error: () => {
          // User is not logged in, add to guest cart
          this.guestCartService.addToCart(this.product, this.selectedQuantity);
          this.toastService.success(`${this.product.nom} added to guest cart! Login to save your cart.`);
        }
      });
  }

  quickView(): void {
    // Navigate to product details
    window.open(`/product/${this.product.produitID}`, '_blank');
  }
}

