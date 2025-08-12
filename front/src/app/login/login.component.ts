import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ScrollService } from '../services/scroll.service';
import { ToastService } from '../shared/services/toast.service';
import { ToastContainerComponent } from '../shared/components/toast-container/toast-container.component';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  imports: [ToastContainerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Component constructor: inject HttpClient and Router services
  constructor(
    private http: HttpClient, 
    private router: Router,
    private scrollService: ScrollService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  // Method called when the component loads
  ngOnInit(): void {
    // Scroll to top when component initializes
    this.scrollService.scrollToTop();
    this.checkAuthStatus(); // Check if the user is already logged in

    // Get HTML elements
    const signUpButton = document.getElementById('signUp') as HTMLButtonElement;
    const signInButton = document.getElementById('signIn') as HTMLButtonElement;
    const container = document.getElementById('container') as HTMLElement;
    const registerForm = document.querySelector('.sign-up-container form') as HTMLFormElement;
    const loginForm = document.querySelector('.sign-in-container form') as HTMLFormElement;
    const loginButton = document.getElementById('loginBtn') as HTMLButtonElement;

    // Handle clicks on "Sign Up" and "Sign In" buttons
    if (signUpButton && signInButton && container) {
      // Add class to animate to sign-up panel
      signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
      });

      // Remove class to return to login panel
      signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
      });
    }

    // Listen for submit event on registration form
    if (registerForm) {
      registerForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent page reload
        this.handleRegistration(); // Call registration method
      });
    }

    // Listen for click on login button
    if (loginButton) {
      loginButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default button behavior
        this.handleLogin(); // Call login method
      });
    }
  }

  // Method to handle user registration
  handleRegistration(): void {
    // Get form input fields
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('r-email') as HTMLInputElement;
    const passwordInput = document.getElementById('r-password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
    const telInput = document.getElementById('tel') as HTMLInputElement;
    const addressInput = document.getElementById('adresse') as HTMLInputElement;
    const regionSelect = document.getElementById('region') as HTMLSelectElement;
    const termsCheckbox = document.getElementById('termes') as HTMLInputElement;

    // Check all fields are filled and terms accepted
    if (!nameInput.value || !emailInput.value || !passwordInput.value ||
        !confirmPasswordInput.value || !telInput.value || !addressInput.value ||
        !regionSelect.value || !termsCheckbox.checked) {
      this.toastService.error('Please fill out all fields and accept the terms and conditions.');
      return;
    }

    // Check that phone number has exactly 8 digits
    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(telInput.value)) {
      this.toastService.error('Phone number must contain exactly 8 digits.');
      return;
    }

    // Check that passwords match
    if (passwordInput.value !== confirmPasswordInput.value) {
      this.toastService.error('Passwords do not match.');
      return;
    }

    // Create an object with form data
    const formData = {
      name: nameInput.value,
      email: emailInput.value,
      password: passwordInput.value,
      address: addressInput.value,
      tel: telInput.value,
      region: regionSelect.value
    };

    // Show loading state for registration
    const registerForm = document.querySelector('.sign-up-container form') as HTMLFormElement;
    const submitButton = registerForm?.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    }

    // Send data to backend to register client
    this.http.post(`${environment.BACK_URL}/Client/registerClient`, formData, { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.toastService.success('Registration successful! Your account has been created.');

        // Reset button state
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = 'Sign Up';
        }

        // Automatically log in after registration
        this.authService.login(formData).subscribe({
          next: (response: any) => {
            this.toastService.success('Login successful! Welcome to PawPals!');
            
            // Wait a moment for the auth service to update, then redirect
            setTimeout(() => {
              this.router.navigate(['/']); // Redirect to home page
            }, 100);
          },
          error: (error) => {
            this.toastService.error('Auto-login failed. Please log in manually.');
          }
        });

        // Reset the form after registration
        (document.querySelector('form') as HTMLFormElement).reset();
      },
      error: (error) => {
        // Reset button state
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = 'Sign Up';
        }

        // Handle different registration error scenarios
        if (error.status === 409 || error.error?.error?.includes('duplicate')) {
          this.toastService.error('An account with this email already exists. Please use a different email or try logging in.');
        } else if (error.status === 400) {
          this.toastService.error('Invalid registration data. Please check your information and try again.');
        } else if (error.status === 500) {
          this.toastService.error('Server error during registration. Please try again later.');
        } else {
          this.toastService.error('Registration failed. Please try again.');
        }
      }
    });
  }

  // Method to handle user login
  handleLogin(): void {
    // Get email and password fields
    const emailInput = document.getElementById('l-email') as HTMLInputElement;
    const passwordInput = document.getElementById('l-password') as HTMLInputElement;
    const rememberMeCheckbox = document.getElementById('remember') as HTMLInputElement;

    // Check fields are not empty
    if (!emailInput.value || !passwordInput.value) {
      this.toastService.error('Please enter your email and password.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      this.toastService.error('Please enter a valid email address.');
      return;
    }

    // Create object with login data
    const loginData = {
      email: emailInput.value,
      password: passwordInput.value,
      rememberme: rememberMeCheckbox.checked
    };

    // Show loading state
    const loginButton = document.getElementById('loginBtn') as HTMLButtonElement;
    if (loginButton) {
      loginButton.disabled = true;
      loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    }

    // Use AuthService login method
    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        console.log('Login successful, response:', response);
        this.toastService.success('Login successful! Welcome back!');

        // Reset button state
        if (loginButton) {
          loginButton.disabled = false;
          loginButton.innerHTML = 'Sign In';
        }

        // Wait a moment for the auth service to update, then redirect
        setTimeout(() => {
          console.log('About to redirect...');
          // Check if there's a redirect URL stored
          const redirectUrl = localStorage.getItem('redirectUrl');
          if (redirectUrl) {
            console.log('Redirecting to stored URL:', redirectUrl);
            localStorage.removeItem('redirectUrl');
            this.router.navigate([redirectUrl]);
          } else {
            console.log('Redirecting to home page');
            this.router.navigate(['/']); // Redirect to home page
          }
        }, 100);
      },
      error: (error) => {
        // Reset button state
        if (loginButton) {
          loginButton.disabled = false;
          loginButton.innerHTML = 'Sign In';
        }

        // Handle different error scenarios
        if (error.status === 404) {
          this.toastService.error('Account not found. Please check your email or register a new account.');
        } else if (error.status === 401) {
          this.toastService.error('Incorrect password. Please try again.');
        } else if (error.status === 500) {
          this.toastService.error('Server error. Please try again later.');
        } else {
          this.toastService.error('Login failed. Please check your credentials and try again.');
        }

        // Clear password field for security
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.focus();
        }
      }
    });
  }

  // Check if user is already logged in (active session on server side)
  checkAuthStatus(): void {
    this.authService.getAuthStatusObservable().pipe(
      filter(authStatus => this.authService.isAuthChecked()) // Wait until auth has been checked
    ).subscribe(
      (authStatus) => {
        if (authStatus.isAuthenticated) {
          console.log('Already logged in'); // Show info if user is authenticated
          this.router.navigate(['/']); // Redirect to home if authenticated
        } else {
          console.log('Not logged in'); // Log error if not authenticated
        }
      }
    );
  }
}
