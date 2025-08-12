import { Component, Input, OnInit } from '@angular/core'; // Importation des décorateurs nécessaires pour le composant
import { HeaderComponent } from "../../components/header/header.component"; // Importation du composant Header
import { FooterComponent } from "../../components/footer/footer.component"; // Importation du composant Footer
import { ProductService } from '../../services/product.service'; // Importation des services pour gérer les produits
import { Product } from '../../models'; // Importation des types
import { ActivatedRoute } from '@angular/router'; // Importation du service ActivatedRoute pour récupérer les paramètres de l'URL
import { CommonModule } from '@angular/common'; // Importation de CommonModule pour utiliser des fonctionnalités Angular communes
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importation d'HttpClient pour effectuer des requêtes HTTP
import { FormsModule } from '@angular/forms'; // Importation de FormsModule pour gérer les formulaires
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-product-details', // Définition du sélecteur pour ce composant
  standalone: true, // Le composant est autonome, il peut être utilisé seul sans module parent
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule], // Déclaration des composants et modules importés dans ce composant
  templateUrl: './product-details.component.html', // Spécification du fichier HTML associé
  styleUrl: './product-details.component.css' // Spécification du fichier CSS associé
})
export class ProductDetailsComponent implements OnInit { // Déclaration du composant ProductDetailsComponent qui implémente OnInit
  product!: Product; // Déclaration de la variable pour stocker le produit récupéré
  specifications: any[] = []; // Déclaration de la variable pour stocker les spécifications du produit
  produitID!: number; // Déclaration de la variable pour stocker l'ID du produit
  selectedQuantity: number = 1; // Initialisation de la quantité sélectionnée à 1
  isLoading: boolean = true; // Loading state
  error: string | null = null; // Error state

  constructor(
    private route: ActivatedRoute, // Injection du service ActivatedRoute pour accéder aux paramètres de l'URL
    private productService: ProductService, // Injection du service ProductService pour gérer les produits
    private http: HttpClient, // Injection du service HttpClient pour effectuer des requêtes HTTP
    private toastService: ToastService
  ) {}

  ngOnInit(): void { // Méthode appelée lors de l'initialisation du composant
    this.loadProduct();
  }

  loadProduct(): void {
    this.isLoading = true;
    this.error = null;
    this.produitID = Number(this.route.snapshot.paramMap.get('id')); // Récupération de l'ID du produit depuis l'URL

    // Récupération des informations du produit à partir du service ProductService
    this.productService.getProductById(this.produitID).subscribe({
      next: (data) => {
        this.product = data;
        console.log(this.product); // Log to verify the product object
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching product:', error);
        this.error = 'Failed to load product details. Please try again.';
        this.isLoading = false;
      }
    });
    
    // Récupération des spécifications du produit à partir du service ProductService
    this.productService.getProductSpecifications(this.produitID).subscribe({
      next: (data) => this.specifications = data, // If the request succeeds, assign the retrieved specifications to the 'specifications' variable
      error: (error) => console.error('Error fetching specifications:', error) // In case of error, display a message in the console
    });
  }

  retryLoad(): void {
    this.loadProduct();
  } 

  // Méthode pour ajouter un produit au panier en envoyant une requête POST
  addToCart(): void {
    this.http.post(
      `http://localhost:5000/Cart/add`, // URL de l'API pour ajouter un produit au panier
      { produitID: this.produitID, quantite: this.selectedQuantity }, // Données envoyées dans la requête (ID du produit et quantité)
      { withCredentials: true } // Indication que les informations d'authentification (cookies, session) doivent être envoyées avec la requête
    ).subscribe(
      () => {
        this.toastService.success('Product added to cart!'); // Success message if the request is successful
      },
      (error) => {
        console.error('Error updating quantity:', error); // Display error in console in case of failure
        if (error.status === 400) { // If the error is due to incorrect quantity
          this.toastService.error("The requested quantity exceeds available stock."); // Display a specific error message
        } else if (error.status === 401) { // If the error is related to authentication
            this.toastService.error("Please authenticate"); // Ask user to log in
        } else {
          this.toastService.error("An error occurred while updating the quantity."); // Generic error message for other issues
        }
      }
    );
  }
}
