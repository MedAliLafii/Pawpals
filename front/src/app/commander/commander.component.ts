// Importing the necessary modules
import { Component, OnInit } from '@angular/core'; // To define the Angular component
import { CommonModule } from '@angular/common'; // Provides common Angular directives like ngIf, ngFor
import { HttpClient } from '@angular/common/http'; // Allows making HTTP requests
import { FormsModule } from '@angular/forms'; // Manages forms
import { Router } from '@angular/router'; // Handles page navigation
import { HeaderComponent } from '../components/header/header.component'; // Importing the header component
import { FooterComponent } from '../components/footer/footer.component'; // Importing the footer component
import { ToastService } from '../shared/services/toast.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { filter, take } from 'rxjs/operators';

// Defining the interface representing a cart item
interface CartItem {
  produitID: number; // Product ID
  nom: string;       // Product name
  quantite: number;  // Quantity of the product in the cart
  prix: number;      // Unit price of the product
}

// Interface for the response type when retrieving the cart
interface CommandeResponse {
  produits: CartItem[]; // List of products in the cart
  total: number;        // Total price of the cart
}

// Declaring the Commander component
@Component({
  selector: 'app-commander', // Selector used in the HTML
  standalone: true, // Standalone component
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent], // Imported modules and components
  templateUrl: './commander.component.html', // Associated HTML file
  styleUrls: ['./commander.component.css'] // Associated CSS file
})
export class CommanderComponent implements OnInit {

  // List of items in the cart
  cartItems: CartItem[] = [];

  // Total price of the cart
  totalPrice: number = 0;

  // Loading indicator to display a spinner or something else
  isLoading: boolean = false;

  // Object representing the order form data
  form = {
    lname: '',    // Client's last name
    region: '',   // Client's region
    houseadd: '', // Client's house address
    phone: '',    // Client's phone number
    payment: ''   // Payment method (not used here)
  };

  // Injecting HttpClient for HTTP requests and Router for navigation
  constructor(
    private http: HttpClient, 
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  // Method automatically called when the component loads
  ngOnInit(): void {
    this.fetchClient(); // Calling the method to retrieve client and cart info
  }

  // Method to fetch client information and cart items
  fetchClient(): void {
    this.isLoading = true; // Activating the loading state

    // Get token for Authorization header
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Fetch fresh client data from database using existing endpoint
    this.http.get(`${environment.BACK_URL}/Client/getClientInfo`, { 
      withCredentials: true,
      headers: headers
    }).subscribe({
      next: (response: any) => {
        // The getClientInfo endpoint returns the client data directly, not wrapped in a 'client' object
        // Filling the form fields with retrieved data
        this.form.lname = response.nom;
        this.form.region = response.region;
        this.form.houseadd = response.adresse;
        this.form.phone = response.tel;
        console.log('Fresh client data loaded in commander:', response);
      },
      error: (error) => {
        // Displaying an error if the request fails
        console.error('Error fetching client info:', error);
        this.isLoading = false;
      }
    });

    // Fetching cart content with Authorization header
    this.http.get<any[]>(`${environment.BACK_URL}/Cart`, { 
      withCredentials: true,
      headers: headers
    }).subscribe(
      (response) => {
        // Updating cart items and total price
        this.cartItems = response;
        this.totalPrice = this.calculateTotal(response);
        this.isLoading = false;
      },
      (error) => {
        // Displaying an error if fetching the cart fails
        console.error('Error fetching cart:', error);
        if (error.status === 401) {
          this.toastService.error("Authentication error. Please log in again.");
          this.router.navigate(['/login']);
        }
        this.isLoading = false;
      }
    );
  }

  // Method to calculate total price from cart items
  calculateTotal(items: any[]): number {
    if (!Array.isArray(items)) {
      return 0;
    }
    return items.reduce((total, item) => {
      const price = Number(item.prix) || 0;
      const quantity = Number(item.quantite) || 0;
      return total + (price * quantity);
    }, 0);
  }

  // Method to calculate the total price of the cart from the items
  getTotal(): number {
    return this.cartItems.reduce(
      (total, item) => total + (Number(item.prix) * item.quantite), 0
    );
  }

  // Helper method to calculate item total for template
  getItemTotal(price: any, quantity: any): number {
    return Number(price || 0) * Number(quantity || 0);
  }

  // Method called when placing the order
  passerComm() {
    // Extracting form data
    const nom = this.form.lname;
    const region = this.form.region;
    const adresse = this.form.houseadd; // Correction: using houseadd, not region
    const tel = this.form.phone;

    // Creating the object to send to update the client info
    var form2 = { nom, region, adresse, tel };

    console.log('Commander - Form data being sent:', form2);
    console.log('Commander - Original form:', this.form);

    // Get token for Authorization header
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Commander - Token:', token);
    console.log('Commander - Headers:', headers);

    // Show loading state
    this.isLoading = true;

    // PUT request to update client info
    this.http.put(`${environment.BACK_URL}/Client/updateClientInfo`, form2, { 
      withCredentials: true,
      headers: headers
    }).subscribe({
      next: (response: any) => {
        console.log('Client info updated successfully:', response);
        this.toastService.success('Client information updated successfully');
        
        // Update the token in localStorage if a new one is provided
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          console.log('New token stored:', response.token);
        }
        
        // Fetch fresh client data to update the form
        this.fetchClient();
        
        // If the update is successful, place the order
        this.http.post(`${environment.BACK_URL}/Cart/commander`, {}, { 
          withCredentials: true,
          headers: headers
        }).subscribe({
          next: () => {
            // Displaying a toast if the order is placed successfully
            this.toastService.success('Your order has been placed successfully');
            this.isLoading = false;
            // Redirecting to the home page
            this.router.navigate(['/home']);
          },
          error: (error) => {
            // Displaying an error if the order fails
            console.error('Error placing order:', error);
            this.isLoading = false;
            if (error.status === 401) {
              this.toastService.error("Authentication error. Please log in again.");
              this.router.navigate(['/login']);
            } else {
              this.toastService.error('Error placing the order: ' + error.error?.error || error.message);
            }
          }
        });
      },
      error: (error) => {
        // Displaying an error if updating client info fails
        console.error('Error updating client info:', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.toastService.error("Authentication error. Please log in again.");
          this.router.navigate(['/login']);
        } else {
          this.toastService.error('Error updating client information: ' + error.error?.error || error.message);
        }
      }
    });
  }

}
