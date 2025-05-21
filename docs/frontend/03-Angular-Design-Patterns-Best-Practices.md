# Angular Design Patterns & Best Practices

## Introduction

This document outlines the key design patterns and best practices implemented in our MortgagePro Loan Management application. These patterns mirror many of the same enterprise-level architectural principles used in financial and banking applications, focusing on security, reliability, and maintainability.

## Design Patterns

### 1. Repository Pattern

Similar to the Data Access Layer (DAL) in Java applications, our services implement the Repository pattern by abstracting data access logic:

```typescript
@Injectable({
  providedIn: 'root'
})
export class LoanApplicationService {
  private apiUrl = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) { }

  getLoanApplications(filters?: { status?: string, borrowerId?: string, search?: string }): Observable<LoanApplication[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) {
        params = params.append('status', filters.status);
      }
      if (filters.borrowerId) {
        params = params.append('borrowerId', filters.borrowerId);
      }
      if (filters.search) {
        params = params.append('search', filters.search);
      }
    }

    return this.http.get<LoanApplication[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }
  
  // Other loan processing methods
}
```

This pattern:
- Encapsulates data access logic
- Provides a clean API for components
- Makes testing easier through well-defined interfaces

### 2. Observer Pattern

Using RxJS, we implement the Observer pattern extensively, similar to Java's Observable/Observer interfaces:

```typescript
// In a service
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();

// In a loan dashboard component
this.authService.currentUser$.subscribe(user => {
  this.isLoggedIn = !!user;
  this.isLoanOfficer = user?.roles.includes('LOAN_OFFICER');
  
  // Load appropriate loans based on user role
  if (this.isLoanOfficer) {
    this.loadAllLoans();
  } else {
    this.loadUserLoans(user?.id);
  }
});
```

This pattern allows for:
- Reactive programming
- Loose coupling between components
- Real-time updates to the UI when data changes

### 3. Singleton Pattern

Core services are implemented as singletons using Angular's dependency injection system, similar to Singleton beans in Spring:

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Service implementation
}
```

The Core module also enforces the singleton pattern with a guard:

```typescript
constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
  if (parentModule) {
    throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
  }
}
```

### 4. Facade Pattern

Services often act as facades that simplify complex operations for components:

```typescript
@Injectable({
  providedIn: 'root'
})
export class LoanSubmissionService {
  constructor(
    private loanApplicationService: LoanApplicationService,
    private documentService: DocumentService,
    private creditCheckService: CreditCheckService,
    private notificationService: NotificationService
  ) { }

  submitLoanApplication(loanId: string, finalDocuments: Document[]): Observable<LoanApplication> {
    return this.documentService.uploadDocuments(loanId, finalDocuments).pipe(
      switchMap(() => this.creditCheckService.requestCreditCheck(loanId)),
      switchMap(creditCheck => this.loanApplicationService.updateLoanStatus(loanId, 'SUBMITTED', { creditScore: creditCheck.score })),
      tap(loan => this.notificationService.notify(`Loan application #${loan.applicationNumber} has been successfully submitted`)),
      catchError(error => {
        this.notificationService.notifyError('Failed to submit loan application');
        return throwError(error);
      })
    );
  }
}
```

This pattern:
- Simplifies complex workflows
- Reduces component complexity
- Improves testability

### 5. Interceptor Pattern

HTTP Interceptors act similarly to Filters in Java web applications:

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add auth token to requests
    const token = this.authService.getToken();
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

### 6. Strategy Pattern

Implemented through dependency injection, allowing different implementations of the same interface:

```typescript
interface PaymentProcessor {
  processPayment(amount: number): Observable<PaymentResult>;
}

@Injectable()
class CreditCardPaymentService implements PaymentProcessor {
  processPayment(amount: number): Observable<PaymentResult> {
    // Credit card implementation
  }
}

@Injectable()
class PayPalPaymentService implements PaymentProcessor {
  processPayment(amount: number): Observable<PaymentResult> {
    // PayPal implementation
  }
}

// In the module
providers: [
  { provide: PaymentProcessor, useClass: environment.usePayPal ? PayPalPaymentService : CreditCardPaymentService }
]
```

## Angular-Specific Best Practices

### 1. OnPush Change Detection

Using OnPush change detection to improve performance:

```typescript
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  @Input() product!: Product;
}
```

### 2. Async Pipe

Using the async pipe to handle Observable subscriptions automatically:

```html
<div *ngIf="products$ | async as products; else loading">
  <app-product-card *ngFor="let product of products" [product]="product"></app-product-card>
</div>
```

### 3. Presentational and Container Components

Separating components into presentational (dumb) and container (smart) components:

```typescript
// Container component
@Component({
  selector: 'app-product-list-container',
  template: `<app-product-list 
               [products]="products$ | async" 
               (delete)="onDelete($event)">
             </app-product-list>`
})
export class ProductListContainerComponent {
  products$ = this.productService.getProducts();
  
  constructor(private productService: ProductService) {}
  
  onDelete(id: number): void {
    this.productService.deleteProduct(id).subscribe();
  }
}

// Presentational component
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  @Input() products: Product[] = [];
  @Output() delete = new EventEmitter<number>();
}
```

### 4. Reactive Forms

Using reactive forms for complex form handling, similar to Bean Validation in Java:

```typescript
this.productForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  price: [0, [Validators.required, Validators.min(0)]],
  description: ['', Validators.maxLength(500)],
  category: ['', Validators.required]
});
```

### 5. TypeScript Interfaces for Domain Models

Using TypeScript interfaces to define clear contracts for data structures:

```typescript
export interface LoanApplication {
  id?: string;
  applicationNumber: string;
  borrowerId: string;
  status: LoanStatus; // 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'DENIED'
  loanType: LoanType; // 'CONVENTIONAL' | 'FHA' | 'VA' | 'JUMBO' | 'USDA'
  propertyAddress: Address;
  propertyValue: number;
  loanAmount: number;
  downPayment: number;
  interestRate?: number;
  loanTerm: number; // in years
  monthlyPayment?: number;
  dti?: number; // debt-to-income ratio
  ltv?: number; // loan-to-value ratio
  documents?: Document[];
  createdAt?: Date;
  updatedAt?: Date;
  submittedAt?: Date;
  closingDate?: Date;
}
```

## Error Handling Strategies

### 1. Centralized Error Handling

Using an error interceptor for global error handling:

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Error Code: ${error.status}, Message: ${error.message}`;
        }
        
        this.notificationService.error(errorMessage);
        return throwError(() => error);
      })
    );
  }
}
```

### 2. Component-Level Error Handling

Using the `catchError` operator in service calls:

```typescript
this.productService.getProduct(id).pipe(
  catchError(error => {
    this.errorMessage = 'Product not found';
    return EMPTY;
  })
).subscribe(product => this.product = product);
```

## Performance Optimization

### 1. Lazy Loading

Implementing lazy loading for feature modules to reduce initial bundle size:

```typescript
const routes: Routes = [
  {
    path: 'loans',
    loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule)
  }
];
```

### 2. Pure Pipes

Creating pure pipes for transformations:

```typescript
@Pipe({
  name: 'truncate',
  pure: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 100, completeWords: boolean = false, ellipsis: string = '...'): string {
    if (!value) {
      return '';
    }

    if (value.length <= limit) {
      return value;
    }

    if (completeWords) {
      limit = value.substring(0, limit).lastIndexOf(' ');
    }

    return `${value.substring(0, limit)}${ellipsis}`;
  }
}
```

### 3. TrackBy Function

Using trackBy functions in ngFor directives:

```html
<div *ngFor="let product of products; trackBy: trackByProductId">
  {{ product.name }}
</div>
```

```typescript
trackByProductId(index: number, product: Product): number {
  return product.id;
}
```

## State Management Approaches

### 1. Service-Based State Management

Using BehaviorSubjects in services for simple state management:

```typescript
@Injectable({
  providedIn: 'root'
})
export class LoanApplicationStateService {
  private loanApplicationSubject = new BehaviorSubject<LoanApplication | null>(null);
  public loanApplication$ = this.loanApplicationSubject.asObservable();
  
  private loanStepsSubject = new BehaviorSubject<{
    currentStep: number;
    totalSteps: number;
    stepsCompleted: boolean[];
  }>({ currentStep: 1, totalSteps: 4, stepsCompleted: [false, false, false, false] });
  public loanSteps$ = this.loanStepsSubject.asObservable();
  
  updateLoanApplication(updates: Partial<LoanApplication>): void {
    const currentApp = this.loanApplicationSubject.value;
    if (currentApp) {
      this.loanApplicationSubject.next({ ...currentApp, ...updates });
      this.updateStepCompletion();
    }
  }
  
  moveToNextStep(): void {
    const currentSteps = this.loanStepsSubject.value;
    if (currentSteps.currentStep < currentSteps.totalSteps) {
      this.loanStepsSubject.next({
        ...currentSteps,
        currentStep: currentSteps.currentStep + 1
      });
    }
  }
  
  private updateStepCompletion(): void {
    // Logic to determine which steps are complete based on application data
  }
}
```

### 2. Component State Management

Managing local state with RxJS's scan operator:

```typescript
@Component({
  selector: 'app-counter',
  template: `<button (click)="increment()">+</button>
             {{count$ | async}}
             <button (click)="decrement()">-</button>`
})
export class CounterComponent {
  private countSubject = new Subject<number>();
  count$ = this.countSubject.pipe(
    startWith(0),
    scan((acc, curr) => acc + curr, 0)
  );
  
  increment(): void {
    this.countSubject.next(1);
  }
  
  decrement(): void {
    this.countSubject.next(-1);
  }
}
```

## Security Best Practices

### 1. XSS Prevention

Angular's template syntax automatically escapes values to prevent XSS attacks.

### 2. CSRF Protection

Using the HttpClient with withCredentials for CSRF token handling:

```typescript
this.http.post('/api/endpoint', data, { withCredentials: true })
```

### 3. Secure Authentication

Implementing JWT token storage in a secure manner:

```typescript
// Using HttpOnly cookies through the backend instead of localStorage
login(credentials: Credentials): Observable<User> {
  return this.http.post<AuthResponse>('/api/auth/login', credentials, {
    withCredentials: true // Use cookies set by the server with HttpOnly flag
  }).pipe(
    map(response => response.user)
  );
}
```

## Testing Strategies

### 1. Component Testing

Using TestBed for component testing:

```typescript
describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductListComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: ProductService, useValue: mockProductService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### 2. Service Testing

Using jasmine's spyOn for service testing:

```typescript
describe('LoanApplicationService', () => {
  let service: LoanApplicationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LoanApplicationService]
    });
    service = TestBed.inject(LoanApplicationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should retrieve loan applications', () => {
    const mockLoans: LoanApplication[] = [/* mock loan applications */];
    
    service.getLoanApplications().subscribe(loans => {
      expect(loans).toEqual(mockLoans);
    });
    
    const req = httpMock.expectOne(`${environment.apiUrl}/loans`);
    expect(req.request.method).toBe('GET');
    req.flush(mockLoans);
  });
});
```

## Conclusion

These design patterns and best practices create a robust, maintainable, and secure mortgage loan management application. By following established patterns from financial software development, the application maintains a clean architecture with a special focus on data integrity, security, and audit requirements essential for financial applications. The patterns ensure the application can scale to handle complex mortgage workflows while maintaining high performance and reliability requirements expected in financial systems.
