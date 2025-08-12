import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FlexibleAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
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
    
    // Route requires authentication, wait for auth service to be ready
    return this.authService.getAuthStatusObservable().pipe(
      filter(authStatus => this.authService.isAuthChecked()), // Wait until auth has been checked
      take(1), // Take only the first emission after auth is checked
      map(authStatus => {
        if (authStatus.isAuthenticated) {
          // User is authenticated, allow access
          return true;
        } else {
          // User is not authenticated, redirect to login
          localStorage.setItem('redirectUrl', state.url);
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
