import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { PetFiltersComponent } from '../components/pet-filters/pet-filters.component';
import { PethomeComponent } from '../components/pethome/pethome.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ScrollService } from '../services/scroll.service';
import { ToastService } from '../shared/services/toast.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { filter, take } from 'rxjs/operators';
@Component({
  selector: 'app-adoption',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, PetFiltersComponent, PethomeComponent], // Ensure PethomeComponent is included here
  templateUrl: './adoption.component.html',
  styleUrls: ['./adoption.component.css']
})
export class AdoptionComponent implements OnInit, OnChanges {
  @Input() filters!: { location: string; types: string[]; ages: number };
  filteredPets: any[] = [];
  allPets: any[] = [];
  isLoggedIn: boolean = false;
  clientId: number = 0;

  constructor(
    private http: HttpClient,
    private router: Router, // Inject Router service for navigation
    private scrollService: ScrollService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Scroll to top when component initializes
    this.scrollService.scrollToTop();
    this.checkAuthStatus();
  }

  
  ngOnChanges(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const { location, types, ages } = this.filters;

    this.filteredPets = this.allPets.filter(pet => {
      const matchLocation = location ? pet.location === location : true;
      const matchType = types.length ? types.includes(pet.type) : true;
      const matchAge = ages ? ages === pet.age : true;

      return matchLocation && matchType && matchAge;
    });
  }

  checkAuthStatus(): void {
    this.authService.getAuthStatusObservable().pipe(
      filter(authStatus => this.authService.isAuthChecked()),
      take(1)
    ).subscribe(
      (authStatus) => {
        if (authStatus.isAuthenticated) {
          console.log('Logged in:', authStatus.user);
          this.clientId = authStatus.user.clientID;
          this.isLoggedIn = true;
        } else {
          console.log('Not logged in');
          this.isLoggedIn = false;
        }
      }
    );
  }

  handlePostAdoption(event: MouseEvent): void {
    event.preventDefault();
    if (this.isLoggedIn) {
      this.router.navigate(['/post']); // Navigate to post page
    } else {
      this.toastService.error('You must be logged in to post a pet for adoption.');
      this.router.navigate(['/login']);
    }
  }

  // Listen for filter changes
  onFiltersChanged(filters: { location: string, types: string[], ages: number }): void {
    this.filters = filters;
    console.log('Filters updated:', this.filters);
  }
}
