import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if user is logged in
    if (this.authService.isLoggedIn() && !this.authService.isTokenExpired()) {
      
      // Check if route has data.roles defined and user has required role
      if (route.data['roles'] && route.data['roles'].length > 0) {
        const requiredRoles = route.data['roles'] as Array<string>;
        const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));
        
        if (!hasRequiredRole) {
          console.log('User does not have required role to access this route');
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }
      
      return true;
    }
    
    // User is not logged in or token is expired
    // Store the attempted URL for redirecting after login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
