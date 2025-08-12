import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../../environments/environment';

export interface Review {
  reviewID: number;
  produitID: number;
  clientID: number;
  rating: number;
  comment: string;
  datePosted: Date;
  clientName: string;
}

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="reviews-container">
      <h4>Customer Reviews</h4>
      
      <!-- Review Form -->
      <div class="review-form mb-4" *ngIf="isLoggedIn">
        <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
          <div class="mb-3">
            <label class="form-label">Rating</label>
            <div class="rating-input">
              <i 
                *ngFor="let star of [1,2,3,4,5]" 
                [class]="star <= selectedRating ? 'fas fa-star text-warning' : 'far fa-star'"
                (click)="setRating(star)"
                style="cursor: pointer; font-size: 1.5rem; margin-right: 0.25rem;"
              ></i>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="comment" class="form-label">Your Review</label>
            <textarea
              id="comment"
              class="form-control"
              rows="3"
              placeholder="Share your experience with this product..."
              formControlName="comment"
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="reviewForm.invalid || isSubmitting"
          >
            <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
            Submit Review
          </button>
        </form>
      </div>

      <!-- Reviews List -->
      <div class="reviews-list">
        <div *ngIf="reviews.length === 0" class="text-center text-muted">
          <i class="fas fa-comments fa-3x mb-3"></i>
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
        
        <div *ngFor="let review of reviews" class="review-item">
          <div class="review-header">
            <div class="reviewer-info">
              <strong>{{ review.clientName }}</strong>
              <div class="rating-display">
                <i 
                  *ngFor="let star of [1,2,3,4,5]" 
                  [class]="star <= review.rating ? 'fas fa-star text-warning' : 'far fa-star'"
                  style="font-size: 0.875rem;"
                ></i>
              </div>
            </div>
            <small class="text-muted">{{ review.datePosted | date:'mediumDate' }}</small>
          </div>
          <div class="review-content">
            <p>{{ review.comment }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reviews-container {
      margin-top: 2rem;
    }
    
    .review-form {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 0.5rem;
    }
    
    .rating-input {
      display: flex;
      align-items: center;
    }
    
    .review-item {
      border-bottom: 1px solid #dee2e6;
      padding: 1rem 0;
    }
    
    .review-item:last-child {
      border-bottom: none;
    }
    
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }
    
    .reviewer-info {
      display: flex;
      flex-direction: column;
    }
    
    .rating-display {
      margin-top: 0.25rem;
    }
    
    .review-content p {
      margin-bottom: 0;
      line-height: 1.5;
    }
    
    @media (max-width: 768px) {
      .review-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .review-header small {
        margin-top: 0.5rem;
      }
    }
  `]
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: number;
  
  reviews: Review[] = [];
  reviewForm: FormGroup;
  selectedRating: number = 0;
  isSubmitting: boolean = false;
  isLoggedIn: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastService: ToastService
  ) {
    this.reviewForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadReviews();
    this.checkAuthStatus();
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
  }

  submitReview(): void {
    if (this.reviewForm.valid && this.selectedRating > 0) {
      this.isSubmitting = true;
      
      const reviewData = {
        produitID: this.productId,
        rating: this.selectedRating,
        comment: this.reviewForm.get('comment')?.value
      };

      this.http.post(`${environment.BACK_URL}/reviews`, reviewData, { withCredentials: true })
        .subscribe({
          next: () => {
            this.toastService.success('Review submitted successfully!');
            this.reviewForm.reset();
            this.selectedRating = 0;
            this.loadReviews();
          },
          error: (error) => {
            console.error('Error submitting review:', error);
            this.toastService.error('Failed to submit review');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
    }
  }

  private loadReviews(): void {
    this.http.get<Review[]>(`${environment.BACK_URL}/reviews/${this.productId}`)
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews;
        },
        error: (error) => {
          console.error('Error loading reviews:', error);
        }
      });
  }

  private checkAuthStatus(): void {
    this.http.get(`${environment.BACK_URL}/Client/checkAuth`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.isLoggedIn = true;
        },
        error: () => {
          this.isLoggedIn = false;
        }
      });
  }
}
