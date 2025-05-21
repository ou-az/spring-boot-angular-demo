# Angular API Integration

## Introduction

This document details the API integration architecture for the MortgagePro Loan Management application. It covers the patterns and practices used for connecting the Angular frontend with the Spring Boot backend, focusing specifically on mortgage loan application processing, user authentication, and data retrieval patterns.

## API Communication Architecture

The application follows a layered approach to API communication:

```text
UI Components → Services → HTTP Interceptors → Spring Boot REST API
```

### Core API Service

The application uses a core API service that provides base functionality for all API calls:

```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(url: string, options?: HttpOptions): Observable<T> {
    return this.http.get<T>(url, options).pipe(
      catchError(this.handleError)
    );
  }

  post<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    return this.http.post<T>(url, body, options).pipe(
      catchError(this.handleError)
    );
  }

  // Other HTTP methods...

  private handleError(error: HttpErrorResponse): Observable<never> {
    // Error handling logic
    return throwError(() => error);
  }
}
```

## Domain-Specific Services

### Loan Application Service

Manages all API calls related to loan applications:

```typescript
@Injectable({
  providedIn: 'root'
})
export class LoanApplicationService {
  private apiUrl = `${environment.apiUrl}/loans`;

  constructor(private apiService: ApiService) {}

  getLoanApplications(filters?: LoanFilters): Observable<LoanApplication[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) {
        params = params.append('status', filters.status);
      }
      if (filters.borrowerId) {
        params = params.append('borrowerId', filters.borrowerId);
      }
      // Add other filters
    }

    return this.apiService.get<LoanApplication[]>(this.apiUrl, { params });
  }

  getLoanById(id: string): Observable<LoanApplication> {
    return this.apiService.get<LoanApplication>(`${this.apiUrl}/${id}`);
  }

  createLoanApplication(loan: LoanApplicationCreate): Observable<LoanApplication> {
    return this.apiService.post<LoanApplication>(this.apiUrl, loan);
  }

  updateLoanApplication(id: string, updates: Partial<LoanApplication>): Observable<LoanApplication> {
    return this.apiService.patch<LoanApplication>(`${this.apiUrl}/${id}`, updates);
  }

  updateLoanStatus(id: string, status: LoanStatus, additionalData?: any): Observable<LoanApplication> {
    return this.apiService.patch<LoanApplication>(
      `${this.apiUrl}/${id}/status`,
      { status, ...additionalData }
    );
  }

  submitLoanApplication(id: string): Observable<LoanApplication> {
    return this.apiService.post<LoanApplication>(`${this.apiUrl}/${id}/submit`, {});
  }

  deleteLoanApplication(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Loan Programs Service

Handles API interactions for mortgage loan programs and rate calculations:

```typescript
@Injectable({
  providedIn: 'root'
})
export class LoanProgramsService {
  private apiUrl = `${environment.apiUrl}/loan-programs`;

  constructor(private apiService: ApiService) {}

  getLoanPrograms(filters?: { type?: string, term?: number }): Observable<LoanProgram[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.type) {
        params = params.append('type', filters.type);
      }
      if (filters.term) {
        params = params.append('term', filters.term.toString());
      }
    }

    return this.apiService.get<LoanProgram[]>(this.apiUrl, { params });
  }

  getLoanProgramById(id: string): Observable<LoanProgram> {
    return this.apiService.get<LoanProgram>(`${this.apiUrl}/${id}`);
  }

  calculateMortgage(params: MortgageCalculationParams): Observable<MortgageCalculationResult> {
    return this.apiService.post<MortgageCalculationResult>(
      `${this.apiUrl}/calculate`,
      params
    );
  }
}
```

## Authentication & Authorization

### Authentication Service

Handles user authentication and token management:

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService, private storageService: StorageService) {
    // Initialize from stored token on application startup
    this.initFromToken();
  }

  login(credentials: { username: string, password: string }): Observable<User> {
    return this.apiService.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.storageService.setToken(response.token);
        this.currentUserSubject.next(response.user);
      }),
      map(response => response.user)
    );
  }

  logout(): void {
    this.storageService.removeToken();
    this.currentUserSubject.next(null);
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.roles.includes(role) || false;
  }

  private initFromToken(): void {
    const token = this.storageService.getToken();
    if (token) {
      try {
        const decodedToken = this.decodeToken(token);
        if (this.isTokenValid(decodedToken)) {
          this.refreshUserDetails().subscribe();
        } else {
          this.logout();
        }
      } catch (e) {
        this.logout();
      }
    }
  }

  refreshUserDetails(): Observable<User> {
    return this.apiService.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  private decodeToken(token: string): any {
    // Token decoding logic
    return null;
  }

  private isTokenValid(decodedToken: any): boolean {
    // Token validation logic
    return false;
  }
}
```

## HTTP Interceptors

### Auth Interceptor

Adds authentication tokens to outgoing requests:

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private storageService: StorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.storageService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(request);
  }
}
```

### Error Interceptor

Handles API error responses, including authentication failures:

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private notificationService: NotificationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Auto logout if 401 response returned from API
          this.authService.logout();
          location.reload();
        }
        
        if (error.status === 403) {
          this.notificationService.showError('Access denied. You do not have permission to perform this action.');
        }
        
        const errorMessage = error.error?.message || error.statusText;
        this.notificationService.showError(errorMessage);
        
        return throwError(() => error);
      })
    );
  }
}
```

## API Response Handling & Models

### Model Interfaces

Clear type definitions for API responses:

```typescript
export interface LoanApplication {
  id?: string;
  applicationNumber: string;
  borrowerId: string;
  status: LoanStatus;
  loanType: LoanType;
  propertyAddress: Address;
  propertyValue: number;
  loanAmount: number;
  downPayment: number;
  interestRate?: number;
  loanTerm: number; // in years
  monthlyPayment?: number;
  documents?: Document[];
  createdAt?: Date;
  updatedAt?: Date;
  submittedAt?: Date;
}

export type LoanStatus = 
  'DRAFT' | 
  'SUBMITTED' | 
  'IN_REVIEW' | 
  'APPROVED' | 
  'DENIED' | 
  'CLOSED' | 
  'ARCHIVED';

export type LoanType = 
  'CONVENTIONAL' | 
  'FHA' | 
  'VA' | 
  'JUMBO' | 
  'USDA';
```

### Response Transformation

Services handle response transformation when needed:

```typescript
getLoanApplications(filters?: LoanFilters): Observable<LoanApplication[]> {
  // API call implementation...
  return this.apiService.get<LoanApplicationDto[]>(this.apiUrl, { params }).pipe(
    map(dtos => dtos.map(dto => this.transformLoanDto(dto)))
  );
}

private transformLoanDto(dto: LoanApplicationDto): LoanApplication {
  return {
    ...dto,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
    submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : undefined,
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined
  };
}
```

## Real-time Data with WebSockets (Optional)

For loan status updates and notifications, the application can optionally use WebSockets:

```typescript
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<any>();
  public messages$ = this.messagesSubject.asObservable();

  constructor(private authService: AuthService) {
    this.authService.currentUser$.pipe(
      filter(user => !!user)
    ).subscribe(() => {
      this.connect();
    });
  }

  connect(): void {
    const token = localStorage.getItem('token');
    this.socket = new WebSocket(`${environment.wsUrl}?token=${token}`);
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messagesSubject.next(data);
    };
    
    this.socket.onclose = () => {
      setTimeout(() => {
        this.connect();
      }, 5000);
    };
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}
```

## Handling File Uploads

For loan documentation uploads:

```typescript
@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  uploadDocument(loanId: string, file: File): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('loanId', loanId);
    
    return this.http.post<Document>(`${this.apiUrl}/upload`, formData);
  }

  uploadDocuments(loanId: string, files: File[]): Observable<Document[]> {
    // Using forkJoin to handle multiple file uploads in parallel
    const uploads = files.map(file => this.uploadDocument(loanId, file));
    return forkJoin(uploads);
  }

  getDocumentsForLoan(loanId: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}?loanId=${loanId}`);
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## API Response Caching

For frequently accessed, rarely changed data like loan programs:

```typescript
@Injectable({
  providedIn: 'root'
})
export class CachingService {
  private cache = new Map<string, {
    timestamp: number,
    data: any
  }>();
  
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  get<T>(key: string): T | null {
    const cachedItem = this.cache.get(key);
    
    if (!cachedItem) {
      return null;
    }
    
    const isExpired = Date.now() - cachedItem.timestamp > this.CACHE_DURATION;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cachedItem.data as T;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      timestamp: Date.now(),
      data
    });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}
```

## Mock API Endpoints for Development

During development, the application can use Angular's HttpInterceptor to mock API responses:

```typescript
@Injectable()
export class MockApiInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Return mocked data for specific endpoints
    if (request.url.includes('/api/loan-programs') && request.method === 'GET') {
      return of(new HttpResponse({
        status: 200,
        body: [
          {
            id: 'prog-1',
            name: 'Conventional 30-Year Fixed',
            type: 'CONVENTIONAL',
            term: 30,
            interestRate: 3.75,
            minLoanAmount: 50000,
            maxLoanAmount: 548250,
            description: 'Standard 30-year fixed-rate mortgage with stable monthly payments.'
          },
          // More mocked loan programs...
        ]
      }));
    }

    // For other requests, pass through to the actual backend
    return next.handle(request);
  }
}
```

## Conclusion

The API integration architecture for the MortgagePro Loan Management application follows a structured approach that emphasizes type safety, error handling, and separation of concerns. The services layer abstracts away the details of HTTP communication while providing strongly-typed interfaces for components to consume.

This architecture enables secure and efficient communication with the Spring Boot backend while maintaining the flexibility needed to handle complex mortgage loan processing workflows. The layered approach allows for easy testing and maintenance while providing a consistent experience across the application.
