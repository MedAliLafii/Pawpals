import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="not-found-container">
      <div class="text-center">
        <div class="error-code">404</div>
        <h1 class="error-title">Oops! Page Not Found</h1>
        <p class="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div class="error-actions">
          <a routerLink="/homee" class="btn btn-primary me-3">
            <i class="fas fa-home"></i> Go Home
          </a>
          <button class="btn btn-outline-secondary" (click)="goBack()">
            <i class="fas fa-arrow-left"></i> Go Back
          </button>
        </div>
        <div class="suggestions mt-4">
          <h5>You might be looking for:</h5>
          <div class="row">
            <div class="col-md-4">
              <a routerLink="/shop" class="suggestion-link">
                <i class="fas fa-shopping-bag"></i>
                <span>Shop Products</span>
              </a>
            </div>
            <div class="col-md-4">
              <a routerLink="/adoption" class="suggestion-link">
                <i class="fas fa-heart"></i>
                <span>Adopt a Pet</span>
              </a>
            </div>
            <div class="col-md-4">
              <a routerLink="/lost" class="suggestion-link">
                <i class="fas fa-search"></i>
                <span>Lost Pets</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .error-code {
      font-size: 8rem;
      font-weight: bold;
      color: #dc3545;
      line-height: 1;
      margin-bottom: 1rem;
    }
    
    .error-title {
      font-size: 2.5rem;
      color: #343a40;
      margin-bottom: 1rem;
    }
    
    .error-message {
      font-size: 1.2rem;
      color: #6c757d;
      margin-bottom: 2rem;
    }
    
    .error-actions {
      margin-bottom: 2rem;
    }
    
    .suggestions h5 {
      color: #495057;
      margin-bottom: 1rem;
    }
    
    .suggestion-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      text-decoration: none;
      color: #495057;
      border: 1px solid #dee2e6;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }
    
    .suggestion-link:hover {
      background-color: #f8f9fa;
      color: #007bff;
      border-color: #007bff;
      text-decoration: none;
    }
    
    .suggestion-link i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    @media (max-width: 768px) {
      .error-code {
        font-size: 6rem;
      }
      
      .error-title {
        font-size: 2rem;
      }
      
      .error-message {
        font-size: 1rem;
      }
    }
  `]
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}
