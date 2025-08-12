import { Routes } from '@angular/router';
import { FlexibleAuthGuard } from './guards/flexible-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'homee', pathMatch: 'full' },
  
  // Public routes
  { 
    path: 'homee', 
    loadComponent: () => import('./pages/homee/homee.component').then(m => m.HomeeComponent),
    title: 'PawPals - Home'
  },
  { 
    path: 'login', 
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    title: 'Login - PawPals'
  },
  { 
    path: 'recuperer-mdp', 
    loadComponent: () => import('./recuperer-mdp/recuperer-mdp.component').then(m => m.RecupererMdpComponent),
    title: 'Reset Password - PawPals'
  },

  { 
    path: 'shop', 
    loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent),
    title: 'Shop - PawPals'
  },
  { 
    path: 'product', 
    loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent),
    title: 'Product Details - PawPals'
  },
  { 
    path: 'product/:id', 
    loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent),
    title: 'Product Details - PawPals'
  },
  { 
    path: 'adoption', 
    loadComponent: () => import('./adoption/adoption.component').then(m => m.AdoptionComponent),
    title: 'Pet Adoption - PawPals'
  },
  { 
    path: 'lost', 
    loadComponent: () => import('./lost/lost.component').then(m => m.LostComponent),
    title: 'Lost Pets - PawPals'
  },
  
  // Protected routes (require authentication)
  { 
    path: 'cart', 
    loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent),
    canActivate: [FlexibleAuthGuard],
    data: { requiresAuth: true },
    title: 'Shopping Cart - PawPals'
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent),
    canActivate: [FlexibleAuthGuard],
    data: { requiresAuth: true },
    title: 'My Profile - PawPals'
  },
  { 
    path: 'commander', 
    loadComponent: () => import('./commander/commander.component').then(m => m.CommanderComponent),
    canActivate: [FlexibleAuthGuard],
    data: { requiresAuth: true },
    title: 'Checkout - PawPals'
  },
  { 
    path: 'post', 
    loadComponent: () => import('./post-adoption/post-adoption.component').then(m => m.PostAdoptionComponent),
    canActivate: [FlexibleAuthGuard],
    data: { requiresAuth: true },
    title: 'Post Pet for Adoption - PawPals'
  },
  { 
    path: 'plost', 
    loadComponent: () => import('./post-lost/post-lost.component').then(m => m.PostLostComponent),
    canActivate: [FlexibleAuthGuard],
    data: { requiresAuth: true },
    title: 'Report Lost Pet - PawPals'
  },
  { 
    path: 'change-password', 
    loadComponent: () => import('./components/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    canActivate: [FlexibleAuthGuard],
    data: { requiresAuth: true },
    title: 'Change Password - PawPals'
  },
  
  // 404 route
  { 
    path: '**', 
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - PawPals'
  }
];
