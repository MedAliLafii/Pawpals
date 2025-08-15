import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = 'Bad request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please log in again.';
            // Only redirect to login for specific protected endpoints that require authentication
            // And only if we're not already on the login page to avoid loops
            if ((req.url.includes('/Cart') || 
                req.url.includes('/Client/profile') ||
                req.url.includes('/Client/updateClientInfo') ||
                req.url.includes('/Client/getClientInfo') ||
                req.url.includes('/Client/changePassword')) &&
                !req.url.includes('/checkAuth')) {
              // Check current route to avoid redirecting if already on login page
              const currentUrl = router.url;
              if (!currentUrl.includes('/login')) {
                router.navigate(['/login']);
              }
            }
            // Don't redirect for checkAuth failures as they're expected for non-authenticated users
            break;
          case 403:
            errorMessage = 'Access forbidden.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
        }
      }

      // Log error for debugging
      console.error('HTTP Error:', error);
      
      // You could also show a toast notification here
      // this.toastService.show(errorMessage, 'error');
      
      return throwError(() => new Error(errorMessage));
    })
  );
};
