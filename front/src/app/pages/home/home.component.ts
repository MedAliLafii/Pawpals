import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component'; // Importation du composant d'en-tête
import { FooterComponent } from '../../components/footer/footer.component'; // Importation du composant de pied de page
import { PetCardComponent } from '../../components/petcard/petcard.component';
import { PethomeComponent } from '../../components/pethome/pethome.component';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models';
import { CommonModule } from '@angular/common';
import { ScrollService } from '../../services/scroll.service';


@Component({
  selector: 'app-home',
  imports: [HeaderComponent, FooterComponent,PetCardComponent,PethomeComponent, RouterModule,
    ProductCardComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
  
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  products: any[] = [];
  @ViewChild('carousel', { static: false }) carouselRef!: ElementRef;

  private autoScrollInterval: any;
  private scrollDirection: number = 1; // 1 = droite, -1 = gauche
  // Le constructeur injecte le service ProductService pour récupérer les produits
  constructor(
    private productService: ProductService,
    private scrollService: ScrollService
  ) {}

  // Méthode appelée automatiquement à l'initialisation du composant
  ngOnInit(): void {
    // Scroll to top when component initializes
    this.scrollService.scrollToTop();
    
    // Appelle la méthode getProducts du service pour obtenir les produits depuis l'API
    this.productService.getProducts().subscribe(
      (data) => {
        // If the request succeeds, the data is stored in the products array
        this.products = data;
      },
      (error) => {
        // In case of error, a message is displayed in the console
        console.error('Error fetching products:', error);
      }
    );
  }

  ngAfterViewInit(): void {
    this.startAutoScroll();
  }

  scrollCarousel(direction: number): void {
    const carousel = this.carouselRef.nativeElement;
    const scrollAmount = 320;
    carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }

  startAutoScroll(): void {
    const carousel = this.carouselRef.nativeElement;
  
    this.autoScrollInterval = setInterval(() => {
      const scrollAmount = 320; // combien de pixels avancer à chaque fois
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
  
      // Si on atteint la fin, repartir au début doucement
      if (carousel.scrollLeft + scrollAmount >= maxScrollLeft) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 5000); // toutes les 5 secondes
  }
  

  ngOnDestroy(): void {
    clearInterval(this.autoScrollInterval);
  } 


}
