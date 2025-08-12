import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SimpleAuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): Observable<boolean> {
    return this.authService.getAuthStatusObservable().pipe(
      filter(authStatus => this.authService.isAuthChecked()), // Wait until auth has been checked
      take(1), // Take only the first emission after auth is checked
      map(authStatus => {
        if (authStatus.isAuthenticated) {
          console.log('User is authenticated');
          return true; // If the user is authenticated, allow access
        } else {
          console.log('User is not authenticated, redirecting to login');
          this.router.navigate(['/login']);  // Redirect to login if not authenticated
          return false;  // Return false, meaning access is denied
        }
      })
    );
  }
}
