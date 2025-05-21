import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    // Redirect if already logged in
    if (this.authService.isLoggedIn() && !this.authService.isTokenExpired()) {
      this.router.navigate(['/loans/dashboard']);
    }
  }
  
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      // In a real-world environment, we'd connect to the actual backend
      // For this demo, we'll simulate a successful authentication
      const { username, password } = this.loginForm.value;
      
      // Simulating auth service call for the demo
      // In a production environment, this would use this.authService.login(username, password)
      setTimeout(() => {
        // Mock successful authentication
        const mockUser = {
          id: 1,
          username: username,
          email: `${username}@example.com`,
          roles: ['USER']
        };
        
        const mockAuthResponse = {
          token: 'mock-jwt-token-' + Math.random().toString(36).substr(2),
          user: mockUser
        };
        
        // Store authentication data
        localStorage.setItem('auth_token', mockAuthResponse.token);
        localStorage.setItem('currentUser', JSON.stringify(mockAuthResponse.user));
        
        this.isSubmitting = false;
        this.router.navigate(['/loans/dashboard']);
      }, 1000);
      
      /* Real-world implementation would be:
      this.authService.login(username, password).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Invalid username or password';
          console.error('Login error:', error);
        }
      });
      */
    }
  }
}
