import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { PetFiltersComponent } from '../components/pet-filters/pet-filters.component';
import { PethomeComponent } from '../components/pethome/pethome.component';
import { Router } from '@angular/router';
import { AdoptionService, AdoptionPet } from '../services/adoption.service';

@Component({
  selector: 'app-adoption',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, PetFiltersComponent, PethomeComponent], // Ensure PethomeComponent is included here
  templateUrl: './adoption.component.html',
  styleUrls: ['./adoption.component.css']
})
export class AdoptionComponent implements OnInit, OnChanges {
  @Input() filters!: { location: string; types: string[]; ages: number };
  filteredPets: AdoptionPet[] = [];
  allPets: AdoptionPet[] = [];
  isLoggedIn: boolean = true; // Set to true for demo
  clientId: number = 1; // Set to 1 for demo

  constructor(
    private adoptionService: AdoptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdoptionPets();
  }

  
  ngOnChanges(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.filters) return;
    
    const { location, types, ages } = this.filters;

    this.filteredPets = this.allPets.filter(pet => {
      const matchLocation = location ? pet.location === location : true;
      const matchType = types.length ? types.includes(pet.type) : true;
      const matchAge = ages ? ages === pet.age : true;

      return matchLocation && matchType && matchAge;
    });
  }

  loadAdoptionPets(): void {
    this.adoptionService.getAdoptionPets().subscribe(
      (pets) => {
        this.allPets = pets;
        this.filteredPets = pets;
        console.log('Loaded adoption pets:', pets);
      },
      (error) => {
        console.error('Error loading adoption pets:', error);
      }
    );
  }

  handlePostAdoption(event: MouseEvent): void {
    event.preventDefault();
    if (this.isLoggedIn) {
      this.router.navigate(['/post']); // Navigate to post page
    } else {
      alert('You must be logged in to post a pet for adoption.');
      this.router.navigate(['/login']);
    }
  }

  // Listen for filter changes
  onFiltersChanged(filters: { location: string, types: string[], ages: number }): void {
    this.filters = filters;
    console.log('Filters updated:', this.filters);
  }
}
