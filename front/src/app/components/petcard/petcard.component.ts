import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LostDetailsComponent } from '../../popup/lostdetails/lostdetails.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PetFilters } from '../pet-filters/pet-filters.component';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../services/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-petcard',
  imports: [CommonModule, FormsModule, LostDetailsComponent],
  templateUrl: './petcard.component.html',
  styleUrls: ['./petcard.component.css'],
  standalone: true
})
export class PetCardComponent implements OnInit, OnChanges {
  isLoggedIn: boolean = false;
  clientId: number = 0;
  @Input() filters: PetFilters = { location: '', types: [], ages: 0 }; // Input filter property
  @Input() limit?: number;

  pets: any[] = [];  // Array to hold the pets retrieved from the backend
  selectedPet: any = null;
  isLoading: boolean = false; // Add the isLoading property here

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    // Initialize with all pets, then apply filters when they change
    this.fetchLostPets();
  }

   checkAuthStatus(): void {
    this.authService.getAuthStatusObservable().pipe(
      filter(authStatus => this.authService.isAuthChecked()),
      take(1)
    ).subscribe(
      (authStatus) => {
        if (authStatus.isAuthenticated) {
          console.log('Logged in:', authStatus.user);
          this.clientId = authStatus.user.clientid;
          this.isLoggedIn = true;
        } else {
          console.log('Not logged in');
          this.isLoggedIn = false;
        }
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && changes['filters'].currentValue) {
      console.log('Filters changed:', this.filters);
      if (this.filters && (this.filters.location || this.filters.types.length > 0 || this.filters.ages > 0)) {
        this.fetchPets(); // Fetch pets whenever filters change
      } else {
        this.fetchLostPets(); // Load all pets when no filters
      }
    }
  }

  fetchLostPets(){
    this.isLoading = true;
    this.http.get<any[]>(`${environment.BACK_URL}/lostPet/all`)
      .subscribe(
        (data) => {
          const processedPets = data.map(pet => {
            pet.datelost = new Date(pet.datelost);
            return pet;
          });
          this.pets = this.limit ? processedPets.slice(0, this.limit) : processedPets;
          console.log('Fetched pets:', this.pets);
        },
        (error) => {
          console.error('Error while retrieving lost pets', error);
        }
      );
  }

  fetchPets(): void {
    // Add null check for filters
    if (!this.filters) {
      console.warn('Filters not initialized, skipping fetchPets');
      return;
    }

    let queryParams = '';
  
    if (this.filters.location) {
      queryParams += `location=${this.filters.location}&`;
    }
    if (this.filters.types && this.filters.types.length > 0) {
      queryParams += `types=${this.filters.types.join(',')}&`;
    }
    if (this.filters.ages && this.filters.ages > 0) {
      queryParams += `ages=${this.filters.ages}&`; // 'ages_lt' for "less than"
    }
  
    queryParams = queryParams.slice(0, -1);  // Remove the trailing "&"
  
    this.isLoading = true; // Set loading to true while fetching
    this.http.get<any[]>(`${environment.BACK_URL}/lostPet/pets?${queryParams}`)
    .subscribe(
      (response) => {
        this.pets = this.limit ? response.slice(0, this.limit) : response;
        console.log(this.pets);
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching pets:', error);
      }
    );
  }
  loadLostPets() {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.BACK_URL}/lostPet/all`)
      .subscribe({
        next: (data) => {
          this.pets = this.limit ? data.slice(0, this.limit) : data;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading lost pets:', err);
        }
      });
  }
  handleButtonClick(pet: any): void {
    if (this.clientId === pet.clientid) {
      this.deleteLostPet(pet);
    } else {
      this.openPetModal(pet);
    }
  }
  
  deleteLostPet(pet: any): void {
    console.log('Trying to delete pet with ID:', pet.lostpetid);
      if (!confirm('Are you sure you want to delete this lost pet post?')) return;
    
  
      this.http.delete(`${environment.BACK_URL}/lostPet/delete/${pet.lostpetid}`, {
        withCredentials: true
      }).subscribe(
      (res) => {
        this.toastService.success('Lost pet post deleted successfully.');
        this.fetchLostPets(); // Refresh the list after deletion
      },
      (err) => {
        console.error('Error deleting lost pet post:', err);
        this.toastService.error('Failed to delete lost pet post. You may not be the owner.');
      }
    );
  }
  
  
  onFiltersChanged(updatedFilters: { location: string, types: string[], ages: number }): void {
    this.filters = updatedFilters;  // Update the filters in the component
    console.log('Filters updated in parent:', this.filters);
    this.fetchPets();  // Fetch pets with updated filters
  }

  openPetModal(pet: any): void {
    this.selectedPet = pet;  // Set the selected pet to show details in the modal
  }

  closePetModal(): void {
    this.selectedPet = null;  // Close the modal by resetting the selected pet
  }
}
