import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopTitleComponent } from "../../components/shop-title/shop-title.component";
import { FilterComponent } from "../../components/filter/filter.component";
import { ShopGridComponent } from "../../components/shop-grid/shop-grid.component";
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { Router } from '@angular/router'; 
import { CategoryService } from '../../services/categorie.service'; 
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
    private http: HttpClient                  
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

  // Vérifie si le client est connected en appelant l'API côté backend
  checkAuthStatus(): void {
    this.http.get<{ client: any }>(`${environment.apiUrl}/Client/checkAuth`, {
      withCredentials: true // Inclut les cookies dans la requête (pour les sessions)
    }).subscribe(
      (response) => {
        // If the client is connected, display a confirmation and update isLoggedIn
        console.log('Already logged in:', response);
        this.isLoggedIn = true;
      },
      (error) => {
        // Otherwise, indicate that the user is not connected
        console.log('Not logged in:', error);
        this.isLoggedIn = false;
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
    this.http.post(`${environment.apiUrl}/Client/logout`, {}, {
      withCredentials: true // Envoie aussi les cookies de session
    }).subscribe(
      () => {
        // If logout succeeds, display a message, update the state and redirect to home
        alert('Logout successful');
        this.isLoggedIn = false;
        this.router.navigate(['/']);
      },
      (error) => {
        // In case of logout failure, display the error
        console.log('Logout failed:', error);
      }
    );
  }
}
