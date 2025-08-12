// User/Client Models
export interface User {
  clientID: number;
  nom: string;
  email: string;
  adresse?: string;
  tel?: number;
  region?: string;
}

export interface LoginRequest {
  email: string;
  motdepasse: string;
}

export interface RegisterRequest extends LoginRequest {
  nom: string;
  adresse?: string;
  tel?: number;
  region?: string;
}

// Product Models
export interface Product {
  produitID: number;
  nom: string;
  nomCat: string;
  description: string;
  prix: number;
  oldPrice: number;
  stock: number;
  imageURL: string;
  categorieID: number;
  rating?: number;
}

export interface Category {
  categorieID: number;
  nom: string;
  description?: string;
}

// Cart Models
export interface CartItem {
  produitID: number;
  quantite: number;
  product?: Product;
}

export interface Cart {
  panierID: number;
  clientID: number;
  items: CartItem[];
}

// Order Models
export interface Order {
  commandeID: number;
  clientID: number;
  dateCommande: Date;
  statut: string;
  total: number;
  items: OrderItem[];
}

export interface OrderItem {
  produitID: number;
  quantite: number;
  product?: Product;
}

// Pet Models
export interface AdoptionPet {
  adoptionPetID: number;
  clientID: number;
  petName: string;
  breed?: string;
  age?: number;
  gender?: string;
  type?: string;
  imageURL?: string;
  location?: string;
  shelter?: string;
  description?: string;
  goodWithKids: boolean;
  goodWithOtherPets: boolean;
  houseTrained: boolean;
  specialNeeds: boolean;
  datePosted: Date;
}

export interface LostPet {
  lostPetID: number;
  clientID: number;
  petName: string;
  breed?: string;
  age?: number;
  type?: string;
  imageURL?: string;
  dateLost?: Date;
  location?: string;
  description?: string;
  datePosted: Date;
  categorieID?: number;
}

// API Response Models
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
