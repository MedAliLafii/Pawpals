import { Component, OnInit } from '@angular/core';
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
export class AdoptionComponent implements OnInit {
  filters: { location: string; types: string[]; ages: number } = { location: '', types: [], ages: 0 };
  isLoggedIn: boolean = false;
  clientId: number = 0;
  selectedCategory: string = 'all-pets'; // Track selected category

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

  // Handle category card clicks
  onCategoryClick(category: string): void {
    console.log('Category clicked:', category);
    this.selectedCategory = category;
    
    if (category === 'all-pets') {
      // Show all pets
      this.filters = { ...this.filters, types: [] };
    } else if (category === 'dogs') {
      // Show only dogs
      this.filters = { ...this.filters, types: ['Dog'] };
    } else if (category === 'cats') {
      // Show only cats
      this.filters = { ...this.filters, types: ['Cat'] };
    } else if (category === 'other-pets') {
      // Show other pets (birds, etc.)
      this.filters = { ...this.filters, types: ['Bird', 'Other'] };
    }
    
    console.log('Filters after category click:', this.filters);
  }
}
