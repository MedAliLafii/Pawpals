import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models';
import { RouterModule, Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { GuestCartService } from '../../services/guest-cart.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { filter, take } from 'rxjs/operators'; 

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
    private guestCartService: GuestCartService,
    private router: Router,
    private authService: AuthService
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

    // Check if user is logged in using auth service
    this.authService.getAuthStatusObservable().pipe(
      filter(authStatus => this.authService.isAuthChecked()),
      take(1)
    ).subscribe({
      next: (authStatus) => {
        if (authStatus.isAuthenticated) {
          // User is logged in, add to server cart
          this.http.post(
            `${environment.BACK_URL}/Cart/add`,
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
        } else {
          // User is not logged in, redirect to login
          this.toastService.warning('Please log in to add items to your cart.');
          // Store the current URL to redirect back after login
          localStorage.setItem('redirectUrl', window.location.pathname);
          // Navigate to login page
          this.router.navigate(['/login']);
        }
      }
    });
  }

  quickView(): void {
    // Navigate to product details
    window.open(`/product/${this.product.produitID}`, '_blank');
  }
}

