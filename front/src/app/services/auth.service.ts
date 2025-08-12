import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private currentUser: any = null;
  private authChecked = false;
  private authStatusSubject = new BehaviorSubject<{isAuthenticated: boolean, user: any}>({
    isAuthenticated: false,
    user: null
  });

  constructor(private http: HttpClient) {
    // Check if user is already authenticated on service initialization
    this.checkAuthStatus().subscribe();
  }

  // Set authentication state after successful login
  setAuthState(user: any, token?: string): void {
    console.log('Setting auth state:', { user, token });
    this.isAuthenticated = true;
    this.currentUser = user;
    this.authChecked = true;
    
    // Store token in localStorage if provided
    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
    }
    
    this.authStatusSubject.next({
      isAuthenticated: true,
      user: user
    });
    console.log('Auth state updated, isAuthenticated:', this.isAuthenticated);
  }

  // Login method
  login(loginData: any): Observable<any> {
    return this.http.post(`${environment.BACK_URL}/Client/loginClient`, loginData, { 
      withCredentials: true 
    }).pipe(
      tap((response: any) => {
        // Update auth state after successful login
        this.setAuthState(response.client, response.token);
      })
    );
  }

  // Check authentication status using both cookies and localStorage
  checkAuthStatus(): Observable<boolean> {
    // First try with cookies (preferred method)
    return this.http.get<{ client: any }>(`${environment.BACK_URL}/Client/checkAuth`, { 
      withCredentials: true 
    }).pipe(
      tap((response) => {
        this.isAuthenticated = true;
        this.currentUser = response.client;
        this.authChecked = true;
        this.authStatusSubject.next({
          isAuthenticated: true,
          user: response.client
        });
      }),
      map((response) => {
        return true;
      }),
      catchError((error) => {
        // If cookie-based auth fails, try localStorage fallback
        const token = localStorage.getItem('authToken');
        if (token) {
          // Verify token with backend
          return this.verifyToken(token).pipe(
            tap((response) => {
              this.isAuthenticated = true;
              this.currentUser = response.client;
              this.authChecked = true;
              this.authStatusSubject.next({
                isAuthenticated: true,
                user: response.client
              });
            }),
            map((response) => {
              return true;
            }),
            catchError(() => {
              // Token is invalid, clear localStorage
              this.clearAuth();
              return of(false);
            })
          );
        }
        this.authChecked = true;
        this.authStatusSubject.next({
          isAuthenticated: false,
          user: null
        });
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

  // Get auth status as observable
  getAuthStatusObservable(): Observable<{isAuthenticated: boolean, user: any}> {
    return this.authStatusSubject.asObservable();
  }

  // Check if auth has been checked
  isAuthChecked(): boolean {
    return this.authChecked;
  }

  // Clear authentication data
  clearAuth(): void {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.authChecked = true;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.authStatusSubject.next({
      isAuthenticated: false,
      user: null
    });
  }

  // Logout
  logout(): Observable<any> {
    return this.http.post(`${environment.BACK_URL}/Client/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.clearAuth();
      }),
      map(() => {
        return true;
      }),
      catchError(() => {
        this.clearAuth();
        return of(true);
      })
    );
  }
}
