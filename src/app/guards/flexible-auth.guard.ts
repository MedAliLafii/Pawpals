import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlexibleAuthGuard implements CanActivate {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Check if this route requires authentication
    const requiresAuth = route.data['requiresAuth'] || false;
    
    if (!requiresAuth) {
      // Route doesn't require authentication, allow access immediately
      return of(true);
    }
    
    // Route requires authentication, check if user is authenticated
    return this.http.get(`${environment.apiUrl}/Client/checkAuth`, { withCredentials: true })
      .pipe(
        map(() => {
          // User is authenticated, allow access
          return true;
        }),
        catchError(() => {
          // User is not authenticated, redirect to login
          localStorage.setItem('redirectUrl', state.url);
          this.router.navigate(['/login']);
          return of(false);
        })
      );
  }
}
