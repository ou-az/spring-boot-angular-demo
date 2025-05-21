import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component';
import { LoginComponent } from './features/auth/components/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent }, // Home now serves as the login page
      { path: 'about', component: AboutComponent }, // New About page with previous home content
      { 
        path: 'products', 
        loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule) 
      }
    ]
  },
  // Fallback when no routes match
  { path: '**', redirectTo: '' }
];
