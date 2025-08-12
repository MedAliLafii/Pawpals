import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { ToastService } from '../shared/services/toast.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { filter, take } from 'rxjs/operators';

interface PostAdoptionForm {
  petName: string;
  breed: string;
  age: string;
  gender: string;
  type: string;
  image: File | null;
  location: string;
  shelter: string;
  description: string;
  goodWithKids: boolean;
  goodWithOtherPets: boolean;
  houseTrained: boolean;
  specialNeeds: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  [key: string]: string | File | boolean | null;}


@Component({
  selector: 'app-post-adoption',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './post-adoption.component.html',
  styleUrls: ['./post-adoption.component.css']
})
export class PostAdoptionComponent implements OnInit {
  
  formData: PostAdoptionForm = {
    petName: '',
    breed: '',
    age: '',
    gender: '',
    type: '',
    image: null,
    location: '',
    shelter: '',
    description: '',
    goodWithKids: false,
    goodWithOtherPets: false,
    houseTrained: false,
    specialNeeds: false,
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  };
  

  imagePreview: string | null = null;
  isSubmitting: boolean = false;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchClient();
  }
  

  fetchClient(): void {
    this.authService.getAuthStatusObservable().pipe(
      filter(authStatus => this.authService.isAuthChecked()),
      take(1)
    ).subscribe({
      next: (authStatus) => {
        if (authStatus.isAuthenticated && authStatus.user) {
          // Fill in the form with client information from auth service
          this.formData.contactName = authStatus.user.nom;
          this.formData.contactPhone = authStatus.user.tel;
          this.formData.contactEmail = authStatus.user.email;
        }
      },
      error: (error) => {
        console.error('Error getting auth status:', error);
      }
    });
  }

  handleImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.formData.image = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.formData.image = null;
  }

  triggerFileInput(): void {
    document.getElementById('image')?.click();
  }

  handleSelectChange(field: string, event: any): void {
    this.formData[field] = event.target.value;
  }

  handleSubmit(): void {
    this.isSubmitting = true;
  
    // Get current user info from auth service
    this.authService.getAuthStatusObservable().pipe(
      filter(authStatus => this.authService.isAuthChecked()),
      take(1)
    ).subscribe({
      next: (authStatus) => {
        if (authStatus.isAuthenticated && authStatus.user) {
          // Step 1: Merge with updated fields
          const updatedClientInfo = {
            ...authStatus.user,
            nom: this.formData.contactName,
            tel: this.formData.contactPhone,
            email: this.formData.contactEmail
          };
  
          // Step 2: Send full updated client info
          this.http.put(`${environment.BACK_URL}/Client/updateClientInfo`, updatedClientInfo, { withCredentials: true }).subscribe({
            next: () => {
              // Step 3: Build FormData for adoption
              const formData = new FormData();
              for (const key in this.formData) {
                if (this.formData[key] !== undefined && this.formData[key] !== null) {
                  if (typeof this.formData[key] === 'boolean') {
                    formData.append(key, this.formData[key].toString());
                  } else {
                    formData.append(key, this.formData[key] as string | Blob);
                  }
                }
              }
  
              // Step 4: Post adoption data
              this.http.post(`${environment.BACK_URL}/adoptPet/add`, formData, { withCredentials: true }).subscribe({
                next: () => {
                  this.toastService.success('Pet adoption posted successfully!');
                  this.router.navigate(['/adoption']);
                  this.isSubmitting = false;
                },
                error: (error) => {
                  console.error('Error posting adoption:', error);
                  this.toastService.error('Error posting adoption: ' + (error.error?.error || error.message));
                  this.isSubmitting = false;
                }
              });
            },
            error: (error) => {
              console.error('Error updating client info:', error);
              this.toastService.error('Error updating contact info: ' + (error.error?.error || error.message));
              this.isSubmitting = false;
            }
          });
        } else {
          this.toastService.error('You must be logged in to post an adoption.');
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error getting auth status:', error);
        this.toastService.error('Authentication error. Please try again.');
        this.isSubmitting = false;
      }
    });
  }
  
  
  

  navigateToAdopt(): void {
    this.router.navigate(['/adopt']);
  }
}
