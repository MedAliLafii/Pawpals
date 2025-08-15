// User/Client Models
export interface User {
  clientid: number;
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
  produitid: number;
  nom: string;
  nomCat: string;
  description: string;
  prix: number;
  oldPrice: number;
  stock: number;
  imageurl: string;
  categorieid: number;
  rating?: number;
}

export interface Category {
  categorieid: number;
  nom: string;
  description?: string;
}

// Cart Models
export interface CartItem {
  produitid: number;
  quantite: number;
  product?: Product;
}

export interface Cart {
  panierid: number;
  clientid: number;
  items: CartItem[];
}

// Order Models
export interface Order {
  commandeid: number;
  clientid: number;
  datecommande: Date;
  statut: string;
  total: number;
  items: OrderItem[];
}

export interface OrderItem {
  produitid: number;
  quantite: number;
  product?: Product;
}

// Pet Models
export interface AdoptionPet {
  adoptionpetid: number;
  clientid: number;
  petname: string;
  breed?: string;
  age?: number;
  gender?: string;
  type?: string;
  imageurl?: string;
  location?: string;
  shelter?: string;
  description?: string;
  goodwithkids: boolean;
  goodwithotherpets: boolean;
  housetrained: boolean;
  specialneeds: boolean;
  dateposted: Date;
}

export interface LostPet {
  lostpetid: number;
  clientid: number;
  petname: string;
  breed?: string;
  age?: number;
  type?: string;
  imageurl?: string;
  datelost?: Date;
  location?: string;
  description?: string;
  dateposted: Date;
  categorieid?: number;
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
