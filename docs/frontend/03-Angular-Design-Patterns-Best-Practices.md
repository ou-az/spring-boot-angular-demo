# Angular Design Patterns & Best Practices

## Introduction

This document outlines the key design patterns and best practices implemented in our Spring Boot Angular demo application. These patterns mirror many of the same enterprise-level architectural principles you've successfully implemented in Java applications, including the LeaseHawk Telephony Routing Platform and your Spring Boot microservices work.

## Design Patterns

### 1. Repository Pattern

Similar to the Data Access Layer (DAL) in Java applications, our services implement the Repository pattern by abstracting data access logic:

```typescript
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getProducts(filters?: { category?: string, search?: string }): Observable<Product[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.category) {
        params = params.append('category', filters.category);
      }
      if (filters.search) {
        params = params.append('search', filters.search);
      }
    }

    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }
  
  // Other CRUD methods
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

// In a component
this.authService.currentUser$.subscribe(user => {
  this.isLoggedIn = !!user;
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
export class CheckoutService {
  constructor(
    private cartService: CartService,
    private paymentService: PaymentService,
    private orderService: OrderService
  ) { }

  completeCheckout(paymentDetails: PaymentDetails): Observable<Order> {
    return this.cartService.getCart().pipe(
      switchMap(cart => this.paymentService.processPayment(cart.total, paymentDetails)),
      switchMap(paymentResult => this.orderService.createOrder(paymentResult.transactionId))
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
export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  inStock: boolean;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
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
    path: 'products',
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
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();
  
  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.cartItemsSubject.value;
    const existingItemIndex = currentCart.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex > -1) {
      const updatedCart = [...currentCart];
      updatedCart[existingItemIndex].quantity += quantity;
      this.cartItemsSubject.next(updatedCart);
    } else {
      this.cartItemsSubject.next([...currentCart, { product, quantity }]);
    }
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
describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should retrieve products', () => {
    const mockProducts: Product[] = [/* mock data */];
    
    service.getProducts().subscribe(products => {
      expect(products).toEqual(mockProducts);
    });
    
    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });
});
```

## Conclusion

These design patterns and best practices create a robust, maintainable, and performant Angular application. By following established patterns familiar to enterprise Java development, the application maintains a clean architecture that's easy to extend and maintain. Many of these patterns directly mirror concepts from your Java development experience, particularly with Spring Boot microservices and the LeaseHawk Telephony Routing Platform.
