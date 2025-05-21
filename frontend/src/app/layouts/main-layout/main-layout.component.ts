import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  // Current year for the footer copyright
  currentYear = new Date().getFullYear();
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load user data from storage if available
    if (this.isAuthenticated()) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn() && !this.authService.isTokenExpired();
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/']);
  }
}
