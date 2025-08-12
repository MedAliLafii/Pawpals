import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from './environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SimpleAuthGuard implements CanActivate {
  constructor(private router: Router, private http: HttpClient) {}

  canActivate(): Observable<boolean> {
    return this.http.get<{client: any}>(`${environment.BACK_URL}/Client/checkAuth`, { withCredentials: true }).pipe(
      map((response) => {
        console.log(response);
        return true; // If the API call is successful, the user is authenticated
      }),
      catchError((error) => {
        console.error('Error fetching authentication status:', error);
        this.router.navigate(['/login']);  // Redirect to login if there's an error
        return of(false);  // Return an observable of false, meaning access is denied
      })
    );
  }
}
