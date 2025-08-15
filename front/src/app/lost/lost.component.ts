import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router for navigation
import { PetCardComponent } from '../components/petcard/petcard.component';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { PetFiltersComponent } from '../components/pet-filters/pet-filters.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScrollService } from '../services/scroll.service';
import { ToastService } from '../shared/services/toast.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-lost',
  templateUrl: './lost.component.html',
  styleUrls: ['./lost.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, PetCardComponent, HeaderComponent, FooterComponent, PetFiltersComponent]
})
export class LostComponent implements OnInit {
  filters: { location: string; types: string[]; ages: number } = { location: '', types: [], ages: 0 };
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



  // Listen for filter changes
  onFiltersChanged(filters: { location: string, types: string[], ages: number }): void {
    this.filters = filters;
    console.log('Filters updated:', this.filters);
  }

  // Vérifie si l'utilisateur est connecté
  checkAuthStatus(): void {
    this.authService.getAuthStatusObservable().pipe(
      filter(authStatus => this.authService.isAuthChecked()),
      take(1)
    ).subscribe(
      (authStatus) => {
        if (authStatus.isAuthenticated) {
          console.log('Already logged in:', authStatus.user);
          this.isLoggedIn = true;
        } else {
          console.log('Not logged in');
          this.isLoggedIn = false;
        }
      }
    );
  }

  // Handle the "Report a Lost Pet" click event
  handleReportLostPet(event: MouseEvent): void {
    event.preventDefault(); // Prevent the default anchor behavior
    if (this.isLoggedIn) {
      this.router.navigate(['/plost']); // Navigate to the report lost pet page
    } else {
      this.toastService.error('You must be logged in to report a lost pet.');
      this.router.navigate(['/login']); // Redirect to login page if not logged in
    }
  }
}
