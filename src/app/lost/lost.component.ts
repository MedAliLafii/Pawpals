import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PetCardComponent } from '../components/petcard/petcard.component';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { PetFiltersComponent } from '../components/pet-filters/pet-filters.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LostPetService, LostPet } from '../services/lost-pet.service';

@Component({
  selector: 'app-lost',
  templateUrl: './lost.component.html',
  styleUrls: ['./lost.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, PetCardComponent, HeaderComponent, FooterComponent, PetFiltersComponent]
})
export class LostComponent implements OnInit, OnChanges {
  @Input() filters!: { location: string; types: string[]; ages: number };
  filteredPets: LostPet[] = [];
  allPets: LostPet[] = [];
  isLoggedIn: boolean = true; // Set to true for demo
  clientId: number = 1; // Set to 1 for demo

  constructor(
    private lostPetService: LostPetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLostPets();
  }

  ngOnChanges(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.filters) return;
    
    const { location, types, ages } = this.filters;

    this.filteredPets = this.allPets.filter(pet => {
      const matchLocation = location ? pet.location.includes(location) : true;
      const matchType = types.length ? types.includes(pet.type) : true;
      const matchAge = ages ? ages === pet.age : true;

      return matchLocation && matchType && matchAge;
    });
  }

  loadLostPets(): void {
    this.lostPetService.getLostPets().subscribe(
      (pets) => {
        this.allPets = pets;
        this.filteredPets = pets;
        console.log('Loaded lost pets:', pets);
      },
      (error) => {
        console.error('Error loading lost pets:', error);
      }
    );
  }

  // Listen for filter changes
  onFiltersChanged(filters: { location: string, types: string[], ages: number }): void {
    this.filters = filters;
    console.log('Filters updated:', this.filters);
  }



  // Handle the "Report a Lost Pet" click event
  handleReportLostPet(event: MouseEvent): void {
    event.preventDefault(); // Prevent the default anchor behavior
    if (this.isLoggedIn) {
      this.router.navigate(['/plost']); // Navigate to the report lost pet page
    } else {
      alert('You must be logged in to report a lost pet.');
      this.router.navigate(['/login']); // Redirect to login page if not logged in
    }
  }
}
