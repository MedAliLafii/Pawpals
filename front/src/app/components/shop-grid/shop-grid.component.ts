import { Component, OnInit } from '@angular/core'; 
import { ProductCardComponent } from '../product-card/product-card.component'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { ProductService } from '../../services/product.service';
import { Product } from '../../models'; 
import { FilterComponent } from "../filter/filter.component"; 
import { ActivatedRoute } from '@angular/router'; 

// Déclaration du composant
@Component({
  selector: 'app-shop-grid', 
  imports: [ProductCardComponent, CommonModule, FormsModule, FilterComponent], 
  standalone: true, 
  templateUrl: './shop-grid.component.html', 
  styleUrls: ['./shop-grid.component.css'] 
})
export class ShopGridComponent implements OnInit {
  // Tableau pour stocker les produits affichés
  products: any[] = [];

  // ID de la catégorie sélectionnée (ou null si aucune)
  currentCategoryId: number | null = null;

  // Prix maximal sélectionné pour le filtre
  selectedPrice: number = 50;

  // Search query
  searchQuery: string = '';

  // Injection des services nécessaires via le constructeur
  constructor(
    private productService: ProductService, // Service pour récupérer les produits depuis l'API
    private route: ActivatedRoute // Permet d'accéder aux paramètres de la route (ex: categoryID)
  ) {}

  // Fonction appelée à l'initialisation du composant
  ngOnInit(): void {
    // On s'abonne aux paramètres de la route pour détecter les changements (comme categoryID)
    this.route.queryParams.subscribe((params) => {
      const categoryIdParam = params['categoryID']; // Récupère le paramètre de catégorie
      this.currentCategoryId = categoryIdParam ? +categoryIdParam : null; // Convertit en nombre ou null
      
      // Get search query from URL parameters
      this.searchQuery = params['search'] || '';
      
      this.fetchProducts(); // Récupère les produits filtrés
    });
  }

  // Fonction pour récupérer les produits depuis le service
  fetchProducts(): void {
    console.log('Fetching products with categoryID:', this.currentCategoryId, 'and maxPrice:', this.selectedPrice);
    
    // Si le prix sélectionné est 0, ne rien afficher
    if (this.selectedPrice === 0) {
      this.products = []; // Aucun produit à afficher
      return;
    }

    // If a category is selected, include it in the request, otherwise null
    const categoryID = this.currentCategoryId;

    // Si un prix est sélectionné (> 0), on l'utilise comme filtre
    const maxPrice = this.selectedPrice > 0 ? this.selectedPrice : undefined;

    console.log('Calling productService.getProducts with categoryID:', categoryID, 'and maxPrice:', maxPrice);

    // Appel au service pour récupérer les produits filtrés
    this.productService.getProducts(categoryID, maxPrice).subscribe(
      (data) => {
        // If the request succeeds, store the received products
        this.products = data;
        
        // Apply search filter if search query exists
        if (this.searchQuery.trim()) {
          this.products = this.products.filter(product => 
            product.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        }
      },
      (error) => {
        // In case of error, display it in the console
        console.error('Error while retrieving products:', error);
      }
    );
  }

  // Méthode appelée quand l'utilisateur change la catégorie dans le filtre
  onCategoryChange(categoryID: number | null): void {
    console.log('Shop grid received category change:', categoryID);
    this.currentCategoryId = categoryID; // Met à jour la catégorie sélectionnée
    console.log('Current category ID updated to:', this.currentCategoryId);
    this.fetchProducts(); // Récupère les produits filtrés
  }

  // Méthode appelée quand l'utilisateur change le prix maximal dans le filtre
  onPriceChange(price: number) {
    this.selectedPrice = price; // Met à jour le prix sélectionné
    this.fetchProducts(); // Récupère les produits filtrés
  }
}