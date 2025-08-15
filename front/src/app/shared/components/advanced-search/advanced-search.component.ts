import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface SearchFilters {
  query: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  sortBy: 'name' | 'price' | 'rating' | 'date';
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="advanced-search-container">
      <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
        <div class="row g-3">
          <!-- Search Input -->
          <div class="col-12">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search products..."
                formControlName="query"
              >
            </div>
          </div>

          <!-- Filters Row -->
          <div class="col-md-3">
            <select class="form-select" formControlName="categoryId">
              <option value="">All Categories</option>
              <option *ngFor="let category of categories" [value]="category.categorieid">
                {{ category.nom }}
              </option>
            </select>
          </div>

          <div class="col-md-2">
            <input
              type="number"
              class="form-control"
              placeholder="Min Price"
              formControlName="minPrice"
            >
          </div>

          <div class="col-md-2">
            <input
              type="number"
              class="form-control"
              placeholder="Max Price"
              formControlName="maxPrice"
            >
          </div>

          <div class="col-md-2">
            <select class="form-select" formControlName="sortBy">
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="date">Date</option>
            </select>
          </div>

          <div class="col-md-2">
            <select class="form-select" formControlName="sortOrder">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div class="col-md-1">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                formControlName="inStock"
                id="inStockCheck"
              >
              <label class="form-check-label" for="inStockCheck">
                In Stock
              </label>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="col-12">
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-search"></i> Search
              </button>
              <button type="button" class="btn btn-outline-secondary" (click)="clearFilters()">
                <i class="fas fa-times"></i> Clear
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .advanced-search-container {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
    }
    
    .form-check-label {
      font-size: 0.875rem;
    }
  `]
})
export class AdvancedSearchComponent {
  @Output() searchChange = new EventEmitter<SearchFilters>();
  
  searchForm: FormGroup;
  categories: any[] = [];

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      query: [''],
      categoryId: [''],
      minPrice: [''],
      maxPrice: [''],
      inStock: [false],
      sortBy: ['name'],
      sortOrder: ['asc']
    });

    // Auto-search on form changes
    this.searchForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.onSearch();
    });
  }

  onSearch(): void {
    const filters = this.searchForm.value;
    this.searchChange.emit(filters);
  }

  clearFilters(): void {
    this.searchForm.reset({
      query: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  }
}
