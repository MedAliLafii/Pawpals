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
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="profile-container">
      <div class="profile-header">
        <h2><i class="fas fa-user-circle"></i> My Profile</h2>
        <p>Manage your account information and preferences</p>
      </div>

      <div class="profile-content">
        <!-- Profile Information -->
        <div class="profile-section">
          <h3><i class="fas fa-info-circle"></i> Personal Information</h3>
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="nom">Full Name *</label>
                  <input 
                    type="text" 
                    id="nom" 
                    class="form-control" 
                    formControlName="nom"
                    [class.is-invalid]="profileForm.get('nom')?.invalid && profileForm.get('nom')?.touched"
                  >
                  <div class="invalid-feedback" *ngIf="profileForm.get('nom')?.invalid && profileForm.get('nom')?.touched">
                    Name is required
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="form-group">
                  <label for="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    class="form-control" 
                    formControlName="email"
                    readonly
                    style="background-color: #f8f9fa; cursor: not-allowed;"
                  >
                  <small class="form-text text-muted">Email cannot be changed</small>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="tel">Phone Number</label>
                  <input 
                    type="tel" 
                    id="tel" 
                    class="form-control" 
                    formControlName="tel"
                    placeholder="+216 XX XXX XXX"
                  >
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="form-group">
                  <label for="region">Region</label>
                  <select 
                    id="region" 
                    class="form-control" 
                    formControlName="region"
                  >
                    <option value="">Select your region</option>
                    <option value="Tunis">Tunis</option>
                    <option value="Sfax">Sfax</option>
                    <option value="Sousse">Sousse</option>
                    <option value="Ariana">Ariana</option>
                    <option value="Kairouan">Kairouan</option>
                    <option value="Bizerte">Bizerte</option>
                    <option value="Nabeul">Nabeul</option>
                    <option value="Gabès">Gabès</option>
                    <option value="Tozeur">Tozeur</option>
                    <option value="Monastir">Monastir</option>
                    <option value="Mahdia">Mahdia</option>
                    <option value="Jendouba">Jendouba</option>
                    <option value="Kasserine">Kasserine</option>
                    <option value="Kébili">Kébili</option>
                    <option value="Medenine">Medenine</option>
                    <option value="Ben Arous">Ben Arous</option>
                    <option value="Zaghouan">Zaghouan</option>
                    <option value="Siliana">Siliana</option>
                    <option value="Gafsa">Gafsa</option>
                    <option value="Tataouine">Tataouine</option>
                    <option value="Le Kef">Le Kef</option>
                    <option value="Manouba">Manouba</option>
                    <option value="Sidi Bouzid">Sidi Bouzid</option>
                    <option value="La Manouba">La Manouba</option>
                    <option value="Béja">Béja</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12">
                <div class="form-group">
                  <label for="adresse">Address</label>
                  <textarea 
                    id="adresse" 
                    class="form-control" 
                    formControlName="adresse"
                    rows="2"
                    placeholder="Enter your address"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="profileForm.invalid || isUpdating"
              >
                <span *ngIf="isUpdating" class="spinner-border spinner-border-sm me-2"></span>
                <i class="fas fa-save"></i> Update Profile
              </button>
              <button type="button" class="btn btn-outline-secondary" (click)="resetForm()">
                <i class="fas fa-undo"></i> Reset
              </button>
            </div>
          </form>
        </div>

        <!-- Account Actions -->
        <div class="profile-section">
          <h3><i class="fas fa-cog"></i> Account Actions</h3>
          <div class="action-buttons">
            <button class="btn btn-outline-primary" (click)="changePassword()">
              <i class="fas fa-key"></i> Change Password
            </button>

            <button class="btn btn-outline-danger" (click)="deleteAccount()">
              <i class="fas fa-trash"></i> Delete Account
            </button>
          </div>
        </div>

        <!-- Member Since -->
        <div class="member-info">
          <div class="member-since">
            <span class="member-year">2024</span>
            <span class="member-label">Member since 2024</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      border-radius: 1rem;
    }

    .profile-header h2 {
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .profile-header i {
      margin-right: 0.5rem;
    }

    .profile-section {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .profile-section h3 {
      color: #374151;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
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
      transition: border-color 0.15s ease-in-out;
    }

    .form-control:focus {
      border-color: #22c55e;
      box-shadow: 0 0 0 0.2rem rgba(34, 197, 94, 0.25);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .member-info {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .member-since {
      text-align: center;
      padding: 2rem;
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      border-radius: 0.5rem;
      border: 1px solid #bae6fd;
      width: 100%;
      max-width: 400px;
    }

    .member-year {
      display: block;
      font-size: 3rem;
      font-weight: bold;
      color: #22c55e;
      margin-bottom: 0.5rem;
    }

    .member-label {
      display: block;
      color: #64748b;
      font-size: 1rem;
      font-weight: 500;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 0.5rem;
      border: 1px solid #e9ecef;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #22c55e;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #6c757d;
      font-size: 0.875rem;
    }

         @media (max-width: 768px) {
       .profile-container {
         margin: 1rem auto;
       }
       
       .action-buttons {
         grid-template-columns: 1fr;
       }
       
       .stats-grid {
         grid-template-columns: repeat(2, 1fr);
       }
     }

     .btn:disabled {
       opacity: 0.6;
       cursor: not-allowed;
     }

     .fa-spinner {
       animation: spin 1s linear infinite;
     }

     @keyframes spin {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
     }
  `]
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  isUpdating = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: [''],
      tel: [''],
      region: [''],
      adresse: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    // Get token for Authorization header
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Fetch fresh client data from database using existing endpoint
    this.http.get(`${environment.BACK_URL}/Client/getClientInfo`, { 
      withCredentials: true,
      headers: headers
    }).subscribe({
      next: (response: any) => {
        // The getClientInfo endpoint returns the client data directly, not wrapped in a 'client' object
        this.profileForm.patchValue({
          nom: response.nom || '',
          email: response.email || '',
          tel: response.tel || '',
          region: response.region || '',
          adresse: response.adresse || ''
        });
        console.log('Fresh client data loaded:', response);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.toastService.error('Failed to load profile');
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isUpdating = true;
      const profileData = {
        nom: this.profileForm.value.nom,
        region: this.profileForm.value.region,
        adresse: this.profileForm.value.adresse,
        tel: this.profileForm.value.tel
      };

      // Get token for Authorization header
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      this.http.put(`${environment.BACK_URL}/Client/updateClientInfo`, profileData, { 
        withCredentials: true,
        headers: headers
      })
        .subscribe({
          next: (response: any) => {
            this.toastService.success('Profile updated successfully!');
            
            // Update the token in localStorage if a new one is provided
            if (response.token) {
              localStorage.setItem('authToken', response.token);
              console.log('New token stored:', response.token);
            }
            
            // Reload the user profile to reflect changes
            this.loadUserProfile();
            
            this.isUpdating = false;
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            if (error.status === 401) {
              this.toastService.error('Authentication error. Please log in again.');
              this.router.navigate(['/login']);
            } else {
              this.toastService.error('Failed to update profile');
            }
            this.isUpdating = false;
          }
        });
    }
  }

  resetForm(): void {
    this.loadUserProfile();
    this.toastService.info('Form reset to original values');
  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
  }



  deleteAccount(): void {
    // Create a more detailed confirmation dialog
    const confirmMessage = `Are you absolutely sure you want to delete your account?

This action will permanently:
• Delete your profile and personal information
• Remove all your cart items and order history
• Delete all your pet adoption and lost pet posts
• Cancel any pending orders

This action cannot be undone!`;

    if (confirm(confirmMessage)) {
      // Show loading state
      const deleteButton = document.querySelector('.btn-outline-danger') as HTMLButtonElement;
      if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
      }

      // Get token for Authorization header
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      this.http.delete(`${environment.BACK_URL}/Client/account`, { 
        withCredentials: true,
        headers: headers
      })
        .subscribe({
          next: () => {
            this.toastService.success('Account deleted successfully. We\'re sorry to see you go!');
            
            // Clear any stored user data
            localStorage.removeItem('user');
            sessionStorage.clear();
            
            // Navigate to home page
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 2000);
          },
          error: (error) => {
            // Reset button state
            if (deleteButton) {
              deleteButton.disabled = false;
              deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete Account';
            }

            // Handle different error scenarios
            if (error.status === 401) {
              this.toastService.error('Authentication required. Please log in again.');
            } else if (error.status === 404) {
              this.toastService.error('Account not found.');
            } else if (error.status === 500) {
              this.toastService.error('Server error. Please try again later.');
            } else {
              this.toastService.error('Failed to delete account. Please try again.');
            }
          }
        });
    }
  }
}
