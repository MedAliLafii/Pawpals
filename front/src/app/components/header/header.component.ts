import { Component, OnInit, HostListener } from '@angular/core'; 
import { Router, RouterModule } from '@angular/router'; 
import { CategoryService } from '../../services/categorie.service'; 
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { ToastService } from '../../shared/services/toast.service'; 
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header', 
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ToastContainerComponent], 
  templateUrl: './header.component.html', 
  styleUrl: './header.component.css' 
})
export class HeaderComponent implements OnInit {
  // Array to store categories
  categories: any[] = [];

  // Variable to track the user's login status
  isLoggedIn = false;
  cartItemCount = 0;
  showUserMenu = false;
  userName = '';

  // Search functionality
  searchQuery = '';
  showSearchBar = false;

  // Inject required services through the constructor
  constructor(
    private categoryService: CategoryService, 
    private router: Router,                   
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthService                  
  ) {}

  ngOnInit(): void {
    // Call the service to fetch categories from the API
    this.categoryService.getCategories().subscribe(
      (data) => {
        this.categories = data.slice(0, 7);
      },
      (error) => {
        console.error('Error while fetching categories:', error);
      }
    );

    // Check if the user is logged in
    this.checkAuthStatus();
  }

  // Function to navigate to a specific category
  goToCategory(categoryId: number): void {
    // Redirect to the 'shop' page with a query parameter (categoryID)
    this.router.navigate(['/shop'], {
      queryParams: { categoryID: categoryId }
    });
  }

  // Check if the client is logged in by calling the backend API
  checkAuthStatus(): void {
    this.authService.checkAuthStatus().subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          console.log('Already logged in');
          this.isLoggedIn = true;
          const user = this.authService.getCurrentUser();
          this.userName = user?.nom || 'User';
          // Load cart count after confirming user is logged in
          this.loadCartCount();
        } else {
          console.log('Not logged in');
          this.isLoggedIn = false;
          this.cartItemCount = 0;
          this.userName = '';
        }
      },
      error: (error) => {
        console.log('Auth check error:', error);
        this.isLoggedIn = false;
        this.cartItemCount = 0;
        this.userName = '';
      }
    });
  }

  // Redirect user based on login status
  goToPage(): void {
    if (this.isLoggedIn) {
      // If logged in, log the user out
      this.logout();
    } else {
      // Otherwise, redirect to the login page
      this.router.navigate(['/login']);
    }
  }

    // Function to log out the user
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isLoggedIn = false;
        this.userName = '';
        this.cartItemCount = 0;
        this.toastService.success('Logged out successfully');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails, clear local state
        this.isLoggedIn = false;
        this.userName = '';
        this.cartItemCount = 0;
        this.router.navigate(['/']);
      }
    });
  }

  // User menu methods
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  // Close menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.showUserMenu = false;
    }
    if (!target.closest('.search-container')) {
      this.showSearchBar = false;
    }
  }

  // Search functionality
  toggleSearch(): void {
    this.showSearchBar = !this.showSearchBar;
    if (this.showSearchBar) {
      setTimeout(() => {
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/shop'], {
        queryParams: { search: this.searchQuery.trim() }
      });
      this.showSearchBar = false;
      this.searchQuery = '';
    }
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.performSearch();
    }
  }

  // Load cart item count
  loadCartCount(): void {
    if (this.isLoggedIn) {
      this.http.get<any>(`${environment.BACK_URL}/Cart`, { withCredentials: true })
        .subscribe({
          next: (cart) => {
            // Handle different possible response formats
            if (cart && Array.isArray(cart)) {
              this.cartItemCount = cart.length;
            } else if (cart && cart.items && Array.isArray(cart.items)) {
              this.cartItemCount = cart.items.length;
            } else {
              this.cartItemCount = 0;
            }
          },
          error: () => {
            this.cartItemCount = 0;
          }
        });
    }
  }
}
