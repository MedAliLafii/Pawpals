import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  categorieid: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.BACK_URL}/categorie`;

  constructor(private http: HttpClient) { }
  getCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
