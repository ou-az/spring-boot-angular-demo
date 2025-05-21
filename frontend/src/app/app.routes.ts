import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent }, // Home now serves as the login page
      { path: 'about', component: AboutComponent }, // New About page with previous home content
      { 
        path: 'loan-programs', 
        loadChildren: () => import('./features/loan-programs/loan-programs.module').then(m => m.LoanProgramsModule),
        canActivate: [AuthGuard] // Protect the Loan Programs route with AuthGuard
      },
      { 
        path: 'loans', 
        loadChildren: () => import('./features/loans/loans.module').then(m => m.LoansModule),
        canActivate: [AuthGuard] // Protect the Loans route with AuthGuard
      }
    ]
  },
  // Fallback when no routes match
  { path: '**', redirectTo: '' }
];
