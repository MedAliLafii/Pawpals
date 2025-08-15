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

  // Helper method to get Authorization headers
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.classList.add('dragover');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('dragover');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('dragover');
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.formData.image = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.toastService.error('Please select an image file.');
      }
    }
  }

  handleSelectChange(field: string, event: any): void {
    // Handle select change if needed
  }

  handleSelectKeydown(event: KeyboardEvent): void {
    // Prevent accidental selection when using Tab key
    if (event.key === 'Tab') {
      // Allow normal Tab navigation
      return;
    }
    
    // Prevent selection with Enter key if no value is selected
    if (event.key === 'Enter' && !this.formData.type) {
      event.preventDefault();
      return;
    }
  }

  handleSubmit(): void {
    this.isSubmitting = true;

    // Validate and clean form data before submission
    if (!this.validateAndCleanForm()) {
      this.isSubmitting = false;
      return;
    }

    // Post adoption data
    this.postPet();
  }

  private validateAndCleanForm(): boolean {
    // Trim all string fields to prevent leading/trailing spaces
    this.formData.petName = this.formData.petName?.trim() || '';
    this.formData.breed = this.formData.breed?.trim() || '';
    this.formData.type = this.formData.type?.trim() || '';
    this.formData.gender = this.formData.gender?.trim() || '';
    this.formData.location = this.formData.location?.trim() || '';
    this.formData.shelter = this.formData.shelter?.trim() || '';
    this.formData.description = this.formData.description?.trim() || '';
    this.formData.contactName = this.formData.contactName?.trim() || '';
    this.formData.contactPhone = this.formData.contactPhone?.trim() || '';
    this.formData.contactEmail = this.formData.contactEmail?.trim() || '';

    // Validate required fields
    if (!this.formData.petName) {
      this.toastService.error('Pet name is required.');
      return false;
    }
    if (!this.formData.breed) {
      this.toastService.error('Breed is required.');
      return false;
    }
    if (!this.formData.type) {
      this.toastService.error('Pet type is required.');
      return false;
    }
    if (!this.formData.gender) {
      this.toastService.error('Gender is required.');
      return false;
    }
    if (!this.formData.location) {
      this.toastService.error('Location is required.');
      return false;
    }
    if (!this.formData.description) {
      this.toastService.error('Description is required.');
      return false;
    }
    if (!this.formData.contactName) {
      this.toastService.error('Contact name is required.');
      return false;
    }
    if (!this.formData.contactPhone) {
      this.toastService.error('Contact phone is required.');
      return false;
    }
    if (!this.formData.contactEmail) {
      this.toastService.error('Contact email is required.');
      return false;
    }

    // Validate pet type
    const validTypes = ['Dog', 'Cat', 'Bird', 'Other'];
    if (!validTypes.includes(this.formData.type)) {
      this.toastService.error('Invalid pet type selected.');
      return false;
    }

    return true;
  }
  
  postPet(): void {
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
    this.http.post(`${environment.BACK_URL}/adoptPet/add`, formData, { 
      withCredentials: true,
      headers: this.getAuthHeaders()
    }).subscribe({
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
  }
  
  
  

  navigateToAdopt(): void {
    this.router.navigate(['/adopt']);
  }
}
