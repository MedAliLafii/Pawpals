import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { HeaderComponent } from '../header/header.component';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="change-password-container">
      <div class="change-password-header">
        <h2><i class="fas fa-key"></i> Change Password</h2>
        <p>Update your account password to keep it secure</p>
      </div>

      <div class="change-password-content">
        <div class="change-password-section">
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <div class="form-group">
              <label for="currentPassword">Current Password *</label>
              <input 
                type="password" 
                id="currentPassword" 
                class="form-control" 
                formControlName="currentPassword"
                placeholder="Enter your current password"
              >
            </div>

            <div class="form-group">
              <label for="newPassword">New Password *</label>
              <input 
                type="password" 
                id="newPassword" 
                class="form-control" 
                formControlName="newPassword"
                placeholder="Enter your new password"
              >
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm New Password *</label>
              <input 
                type="password" 
                id="confirmPassword" 
                class="form-control" 
                formControlName="confirmPassword"
                placeholder="Confirm your new password"
              >
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="passwordForm.invalid || isChanging"
              >
                <i class="fas fa-save"></i> Change Password
              </button>
              <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
                <i class="fas fa-arrow-left"></i> Back to Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .change-password-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .change-password-header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      border-radius: 1rem;
    }

    .change-password-section {
      background: white;
      border-radius: 0.5rem;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
      display: block;
    }

    .form-control {
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      padding: 0.75rem;
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background-color: #22c55e;
      color: white;
    }

    .btn-outline-secondary {
      background-color: transparent;
      color: #6c757d;
      border: 1px solid #6c757d;
    }
  `]
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  isChanging = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.authService.getAuthStatusObservable().pipe(
      filter(authStatus => this.authService.isAuthChecked()),
      take(1)
    ).subscribe({
      next: (authStatus) => {
        if (!authStatus.isAuthenticated) {
          this.toastService.error('Please log in to change your password');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
      
      if (newPassword !== confirmPassword) {
        this.toastService.error('New passwords do not match');
        return;
      }

      this.isChanging = true;

      // Get token for Authorization header
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      this.http.post(`${environment.BACK_URL}/Client/changePassword`, {
        currentPassword,
        newPassword
      }, { 
        withCredentials: true,
        headers: headers
      })
        .subscribe({
          next: () => {
            this.toastService.success('Password changed successfully!');
            this.isChanging = false;
            this.passwordForm.reset();
            this.router.navigate(['/profile']);
          },
          error: (error) => {
            this.isChanging = false;
            
            if (error.status === 400) {
              this.toastService.error(error.error?.error || 'Current password is incorrect');
            } else if (error.status === 401) {
              this.toastService.error('Please log in to change your password');
              this.router.navigate(['/login']);
            } else {
              this.toastService.error('Failed to change password. Please try again.');
            }
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
