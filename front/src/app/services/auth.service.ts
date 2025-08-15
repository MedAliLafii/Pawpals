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
    // Don't automatically check auth status on service initialization
    // This will be called explicitly when needed
  }

  // Set authentication state after successful login
  setAuthState(user: any, token?: string): void {
    console.log('AuthService: Setting auth state:', { user: user?.nom, token: token ? 'present' : 'not present' });
    this.isAuthenticated = true;
    this.currentUser = user;
    this.authChecked = true;
    
    // Store token in localStorage if provided
    if (token) {
      localStorage.setItem('authToken', token);
      console.log('AuthService: Token stored in localStorage');
    }
    
    this.authStatusSubject.next({
      isAuthenticated: true,
      user: user
    });
    console.log('AuthService: Auth state updated, isAuthenticated:', this.isAuthenticated);
  }

  // Login method
  login(loginData: any): Observable<any> {
    console.log('AuthService: Starting login process');
    return this.http.post(`${environment.BACK_URL}/Client/loginClient`, loginData, { 
      withCredentials: true 
    }).pipe(
      tap((response: any) => {
        console.log('AuthService: Login successful, response:', response);
        // Update auth state after successful login
        this.setAuthState(response.client, response.token);
      })
    );
  }

  // Check authentication status using both cookies and localStorage
  checkAuthStatus(): Observable<boolean> {
    console.log('AuthService: Starting checkAuthStatus');
    // First try with cookies (preferred method)
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('AuthService: Found token in localStorage:', token.substring(0, 20) + '...');
    } else {
      console.log('AuthService: No token found in localStorage');
    }
    
    return this.http.get<{ client: any }>(`${environment.BACK_URL}/Client/checkAuth`, { 
      withCredentials: true,
      headers: headers
    }).pipe(
      tap((response) => {
        console.log('AuthService: checkAuth successful, response:', response);
        this.isAuthenticated = true;
        this.currentUser = response.client;
        this.authChecked = true;
        this.authStatusSubject.next({
          isAuthenticated: true,
          user: response.client
        });
      }),
      map((response) => {
        console.log('AuthService: Authentication successful');
        return true;
      }),
      catchError((error) => {
        console.log('AuthService: checkAuth failed with error:', error.status, error.message);
        // If cookie-based auth fails, try localStorage fallback
        const token = localStorage.getItem('authToken');
        if (token) {
          console.log('AuthService: Trying localStorage fallback with token');
          // Verify token with backend
          return this.verifyToken(token).pipe(
            tap((response) => {
              console.log('AuthService: Token verification successful:', response);
              this.isAuthenticated = true;
              this.currentUser = response.client;
              this.authChecked = true;
              this.authStatusSubject.next({
                isAuthenticated: true,
                user: response.client
              });
            }),
            map((response) => {
              console.log('AuthService: localStorage fallback successful');
              return true;
            }),
            catchError((verifyError) => {
              console.log('AuthService: Token verification failed:', verifyError);
              // Token is invalid, clear localStorage
              this.clearAuth();
              return of(false);
            })
          );
        }
        console.log('AuthService: No fallback token available, user not authenticated');
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

  // Check if user is currently on login page
  isOnLoginPage(): boolean {
    return window.location.pathname === '/login';
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
