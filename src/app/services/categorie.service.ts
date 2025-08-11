import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  categorieID: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categorie`;

  constructor(private http: HttpClient) { }
  getCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
