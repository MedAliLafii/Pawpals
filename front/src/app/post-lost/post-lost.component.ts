import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Ensure HttpClient is imported
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { ToastService } from '../shared/services/toast.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { filter, take } from 'rxjs/operators';

type LostPetFormFields = {
  name: string;
  breed: string;
  age: string;
  type: string;
  location: string;
  dateLost: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  image: File | null;
};

@Component({
  selector: 'app-post-lost',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './post-lost.component.html',
  styleUrls: ['./post-lost.component.css']
})
export class PostLostComponent implements OnInit {

  isSubmitting = false;
  imagePreview: string | null = null;

  formData: LostPetFormFields = {
    name: '',
    breed: '',
    age: '',
    type: '',
    location: '',
    dateLost: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    image: null,
  };

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

  updateField<K extends keyof LostPetFormFields>(key: K, value: LostPetFormFields[K]) {
    this.formData[key] = value;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.formData.image = file;
  }

  handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.formData.image = file;
      const reader = new FileReader();
      reader.onloadend = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  handleSelectChange<K extends keyof LostPetFormFields>(field: K, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.formData[field] = selectElement.value as LostPetFormFields[K];
  }

  handleSubmit(form: NgForm) {
    this.isSubmitting = true;
  
    const requiredFields: (keyof LostPetFormFields)[] = ['name', 'breed', 'age', 'description', 'dateLost'];
    for (const field of requiredFields) {
      if (!this.formData[field]) {
        this.toastService.error('Please fill all required fields.');
        this.isSubmitting = false;
        return;
      }
    }
  
    // Get current user info from auth service
    this.authService.getAuthStatusObservable().pipe(
      filter(authStatus => this.authService.isAuthChecked()),
      take(1)
    ).subscribe({
      next: (authStatus) => {
        if (authStatus.isAuthenticated && authStatus.user) {
          // Step 1: Merge existing info with updated fields
          const updatedClientInfo = {
            ...authStatus.user,
            nom: this.formData.contactName,
            tel: this.formData.contactPhone,
            email: this.formData.contactEmail
          };
  
          // Step 2: Send full updated client info
          const headers = this.getAuthHeaders();
          this.http.put(`${environment.BACK_URL}/Client/updateClientInfo`, updatedClientInfo, {
            withCredentials: true,
            headers: headers
          }).subscribe({
            next: (response: any) => {
              console.log('Client info updated successfully:', response);
              
              // Update the token in localStorage if a new one is provided
              if (response.token) {
                localStorage.setItem('authToken', response.token);
                console.log('New token stored:', response.token);
              }
              
              // Continue with pet posting
              this.postPet();
            },
            error: (error) => {
              console.error('Error updating client info:', error);
              this.toastService.error('Error updating contact info: ' + (error.error?.error || error.message));
              this.isSubmitting = false;
            }
          });
        } else {
          this.toastService.error('You must be logged in to post a lost pet.');
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
  
  postPet(): void {
    // Step 3: Prepare FormData for lost pet
    const lostPetData = new FormData();
    for (const key in this.formData) {
      const value = this.formData[key as keyof LostPetFormFields];
      if (value !== null && value !== undefined) {
        lostPetData.append(key, value instanceof File ? value : value.toString());
      }
    }

    // Step 4: Post lost pet
    this.http.post(`${environment.BACK_URL}/lostpet/add`, lostPetData, { 
      withCredentials: true,
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.toastService.success('Lost pet posted successfully!');
        this.router.navigate(['/lost']);
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error posting lost pet:', error);
        this.toastService.error('Error posting lost pet: ' + (error.error?.error || error.message));
        this.isSubmitting = false;
      }
    });
  }

  triggerFileInput() {
    const fileInput = document.getElementById('image') as HTMLInputElement;
    fileInput?.click();
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

  removeImage() {
    this.formData.image = null;
    this.imagePreview = null;
  }

  navigateToLost() {
    this.router.navigate(['/lost']);
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
}
