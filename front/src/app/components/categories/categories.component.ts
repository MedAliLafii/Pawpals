import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { CategoryService } from '../../services/categorie.service'; 
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../services/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-categories',
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {

  // Déclaration d'un tableau pour stocker les catégories
  categories: any[] = [];

  // Variable pour suivre l'état de connexion de l'utilisateur
  isLoggedIn = false;

  // Injection des services nécessaires via le constructeur
  constructor(
    private categoryService: CategoryService, 
    private router: Router,                   
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthService                  
  ) {}

  ngOnInit(): void {
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
  }

  // Fonction pour naviguer vers une catégorie spécifique
  goToCategory(categoryId: number): void {
    // Redirige vers la page 'shop' avec un paramètre de requête (categoryID)
    this.router.navigate(['/shop'], {
      queryParams: { categoryID: categoryId }
    });
  }

  // Vérifie si le client est connecté en appelant l'API côté backend
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
