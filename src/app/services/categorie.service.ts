import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  categorieID: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${import.meta.env.BACK_URL}/categorie`;

  constructor(private http: HttpClient) { }
  getCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
