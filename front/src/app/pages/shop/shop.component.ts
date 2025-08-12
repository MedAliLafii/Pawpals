import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopTitleComponent } from "../../components/shop-title/shop-title.component";
import { FilterComponent } from "../../components/filter/filter.component";
import { ShopGridComponent } from "../../components/shop-grid/shop-grid.component";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { Router, ActivatedRoute } from '@angular/router'; 
import { CategoryService } from '../../services/categorie.service'; 
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ScrollService } from '../../services/scroll.service';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../services/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ShopTitleComponent, ShopGridComponent, HeaderComponent, FooterComponent],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent { 
  // Déclaration d'un tableau pour stocker les catégories
  categories: any[] = [];

  // Variable pour suivre l'état de connexion de l'utilisateur
  isLoggedIn = false;

  // Injection des services nécessaires via le constructeur
  constructor(
    private categoryService: CategoryService, 
    private router: Router,
    private route: ActivatedRoute,                   
    private http: HttpClient,
    private scrollService: ScrollService,
    private toastService: ToastService,
    private authService: AuthService                  
  ) {}

  ngOnInit(): void {
    // Scroll to top when component initializes
    this.scrollService.scrollToTop();

    // Appel au service pour récupérer les catégories depuis l'API
    this.categoryService.getCategories().subscribe(
      (data) => {
        this.categories = data.slice(0, 7);
      },
      (error) => {
        console.error('Error while retrieving categories:', error);
      }
    );

    // Vérifie si l'utilisateur est connecté
    this.checkAuthStatus();

    // Listen for query parameter changes (search, categoryID)
    this.route.queryParams.subscribe(params => {
      if (params['search'] || params['categoryID']) {
        // Pass search parameters to shop grid component
        this.handleSearchParams(params);
      }
    });
  }

  handleSearchParams(params: any): void {
    // This will be handled by the shop grid component
    // The search and category filters will be applied there
    console.log('Search params received:', params);
  }

  // Fonction pour naviguer vers une catégorie spécifique
  goToCategory(categoryId: number): void {
    // Redirige vers la page 'shop' avec un paramètre de requête (categoryID)
    this.router.navigate(['/shop'], {
      queryParams: { categoryID: categoryId }
    });
  }

  // Vérifie si le client est connected en appelant l'API côté backend
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

  // Redirige l'utilisateur selon son état de connexion
  goToPage(): void {
    if (this.isLoggedIn) {
      // If connected, disconnect the user
      this.logout();
    } else {
      // Otherwise, redirect to the login page
      this.router.navigate(['/login']);
    }
  }

  // Fonction pour déconnecter l'utilisateur
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // If logout succeeds, display a message, update the state and redirect to home
        this.toastService.success('Logout successful');
        this.isLoggedIn = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        // In case of logout failure, display the error
        console.log('Logout failed:', error);
        // Even if logout fails, clear local state
        this.isLoggedIn = false;
        this.router.navigate(['/']);
      }
    });
  }
}
