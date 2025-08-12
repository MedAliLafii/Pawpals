import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private currentUser: any = null;

  constructor(private http: HttpClient) {
    // Check if user is already authenticated on service initialization
    this.checkAuthStatus();
  }

  // Check authentication status using both cookies and localStorage
  checkAuthStatus(): Observable<boolean> {
    // First try with cookies (preferred method)
    return this.http.get<{ client: any }>(`${environment.BACK_URL}/Client/checkAuth`, { 
      withCredentials: true 
    }).pipe(
      map((response) => {
        this.isAuthenticated = true;
        this.currentUser = response.client;
        return true;
      }),
      catchError((error) => {
        // If cookie-based auth fails, try localStorage fallback
        const token = localStorage.getItem('authToken');
        if (token) {
          // Verify token with backend
          return this.verifyToken(token).pipe(
            map((response) => {
              this.isAuthenticated = true;
              this.currentUser = response.client;
              return true;
            }),
            catchError(() => {
              // Token is invalid, clear localStorage
              this.clearAuth();
              return of(false);
            })
          );
        }
        return of(false);
      })
    );
  }

  // Verify token with backend
  private verifyToken(token: string): Observable<{ client: any }> {
    return this.http.post<{ client: any }>(`${environment.BACK_URL}/Client/verifyToken`, { token });
  }

  // Get current authentication status
  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }

  // Get current user
  getCurrentUser(): any {
    return this.currentUser;
  }

  // Clear authentication data
  clearAuth(): void {
    this.isAuthenticated = false;
    this.currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  // Logout
  logout(): Observable<any> {
    return this.http.post(`${environment.BACK_URL}/Client/logout`, {}, { withCredentials: true }).pipe(
      map(() => {
        this.clearAuth();
        return true;
      }),
      catchError(() => {
        this.clearAuth();
        return of(true);
      })
    );
  }
}
