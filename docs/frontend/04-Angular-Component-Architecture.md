# Angular Component Architecture

## Introduction

This document details the component architecture implemented in our MortgagePro Loan Management application. The component design philosophy mirrors principles found in enterprise financial applications, focusing on security, data integrity, and user experience that meets the complex requirements of mortgage processing systems while following modern front-end architectural best practices.

## Component Hierarchy

Our application follows a hierarchical component structure that promotes reusability, testability, and maintainability:

```text
├── App Component (Root)
│   ├── Main Layout Component
│   │   ├── Header Component
│   │   ├── <Router Outlet>
│   │   │   ├── Home Component
│   │   │   ├── Loan Programs Component
│   │   │   │   ├── Program Item Component
│   │   │   ├── Program Detail Component
│   │   │   ├── Rate Calculator Component
│   │   │   ├── Loan Dashboard Component
│   │   │   ├── Loan Application Component
│   │   │   ├── Loan Detail Component
│   │   │   ├── Login Component
│   │   └── Footer Component
│   └── Notification Component (Global)
```

## Component Types

The application implements different types of components, each with specific responsibilities:

### Container Components (Smart Components)

Container components connect to services, manage state, and pass data to presentational components. Similar to controllers in Spring MVC, these components handle the business logic:

```typescript
@Component({
  selector: 'app-loan-dashboard',
  templateUrl: './loan-dashboard.component.html'
})
export class LoanDashboardComponent implements OnInit {
  loans$!: Observable<LoanApplication[]>;
  statuses: string[] = ['ALL', 'DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'DENIED'];
  selectedStatus = 'ALL';
  
  constructor(
    private loanService: LoanApplicationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    const filters = this.selectedStatus !== 'ALL' ? { status: this.selectedStatus } : {};
    this.loans$ = this.loanService.getLoanApplications(filters);
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.loadLoans();
  }

  archiveLoan(id: string): void {
    if (confirm('Are you sure you want to archive this loan application?')) {
      this.loanService.updateLoanStatus(id, 'ARCHIVED').subscribe(() => {
        this.loadLoans();
      });
    }
  }
}
```

### Presentational Components (Dumb Components)

Presentational components focus solely on UI presentation based on inputs and emit events for user interactions, similar to view templates in Spring MVC:

```typescript
@Component({
  selector: 'app-loan-card',
  templateUrl: './loan-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanCardComponent {
  @Input() loan!: LoanApplication;
  @Output() archive = new EventEmitter<string>();
  @Output() view = new EventEmitter<string>();
  @Output() continue = new EventEmitter<string>();

  get statusClass(): string {
    const statusMap: {[key: string]: string} = {
      'DRAFT': 'status-draft',
      'SUBMITTED': 'status-submitted',
      'IN_REVIEW': 'status-review',
      'APPROVED': 'status-approved',
      'DENIED': 'status-denied'
    };
    return statusMap[this.loan.status] || 'status-default';
  }

  onArchive(event: Event): void {
    event.stopPropagation();
    this.archive.emit(this.loan.id);
  }
}
```

### Layout Components

Layout components define the structure of the application, similar to how Spring templates define the overall layout:

```typescript
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class MainLayoutComponent {
  currentYear = new Date().getFullYear();
}
```

### Standalone Components

For simpler features, we use standalone components that don't require a module. This reduces boilerplate and improves bundle size:

```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Component implementation
}
```

## Component Communication Patterns

Our application uses several communication patterns inspired by enterprise architecture principles:

### Parent-Child Communication

Components communicate with their direct children through inputs and outputs, similar to dependency injection in Spring:

```typescript
// Parent template
<app-loan-card
  [loan]="loan"
  (archive)="onArchive($event)"
  (continue)="onContinue($event)"
  (view)="onView($event)">
</app-loan-card>

// Child component
@Component({ ... })
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
}
```

### Service-Mediated Communication

For components not directly related, communication happens through services, similar to application events in Spring:

```typescript
// NotificationService
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  // Methods to add/remove notifications
}

// Component A creates a notification
this.notificationService.success('Product created successfully');

// Component B displays notifications
@Component({
  selector: 'app-notifications',
  template: `<div *ngFor="let notification of notifications$ | async">
               {{notification.message}}
             </div>`
})
export class NotificationsComponent {
  notifications$ = this.notificationService.notifications$;
}
```

### State Management Communication

For complex applications, a centralized state management approach can be used, similar to service layers in Spring:

```typescript
// Store definition
export interface AppState {
  loans: LoanState;
  loanPrograms: LoanProgramState;
  auth: AuthState;
}

// Component connects to state
@Component({ ... })
export class ProductListComponent {
  products$ = this.store.select(state => state.products.items);
  
  constructor(private store: Store<AppState>) {
    this.store.dispatch(new LoadProducts());
  }
}
```

## Component Lifecycle Management

Each component has a well-defined lifecycle that can be hooked into. This is similar to bean lifecycle management in Spring:

```typescript
@Component({ ... })
export class ProductDetailComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  
  ngOnInit(): void {
    // Component initialization - similar to @PostConstruct in Spring
    this.productService.getProduct(this.productId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(product => this.product = product);
  }
  
  ngOnDestroy(): void {
    // Component cleanup - similar to @PreDestroy in Spring
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
```

## Component Styling

Component styles are encapsulated to prevent global CSS conflicts, using Angular's ViewEncapsulation:

```typescript
@Component({
  selector: 'app-loan-card',
  templateUrl: './loan-card.component.html',
  styleUrls: ['./loan-card.component.scss'],
  encapsulation: ViewEncapsulation.Emulated // Default
})
export class LoanCardComponent { ... }
```

## Component Templates

Templates follow these principles for maintainability:

### Data Binding

Two-way data binding is used sparingly to avoid performance issues:

```html
<!-- One-way binding (preferred for most cases) -->
<div>{{product.name}}</div>
<img [src]="product.imageUrl">

<!-- Two-way binding (used only when necessary, usually in forms) -->
<input [(ngModel)]="searchTerm">
```

### Template Logic

Business logic is kept out of templates, similar to keeping logic out of JSPs in Java web applications:

```html
<!-- Good: Using methods/properties from the component -->
<div *ngIf="isLoanAvailable">Available</div>

<!-- Bad: Complex logic in template -->
<div *ngIf="loan.status === 'APPROVED' && loan.loanAmount > 0 && loan.interestRate < 5">
  Eligible for Refinance
</div>
```

### Content Projection

Components use content projection to create reusable wrappers, similar to template inheritance in server-side applications:

```html
<!-- Card component template -->
<div class="card">
  <div class="card-header" *ngIf="title">{{title}}</div>
  <div class="card-body">
    <ng-content></ng-content>
  </div>
  <div class="card-footer" *ngIf="footer">
    <ng-content select="[footer]"></ng-content>
  </div>
</div>

<!-- Usage -->
<app-card title="Product Details">
  <div>{{product.description}}</div>
  <button footer>Add to Cart</button>
</app-card>
```

## Performance Optimization

### Change Detection Strategy

OnPush change detection is used for performance optimization in presentational components:

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

### Lazy Loading Components

Components in feature modules are lazy-loaded:

```typescript
const routes: Routes = [
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.module')
      .then(m => m.ProductsModule)
  }
];
```

### Virtual Scrolling

For long lists, virtual scrolling is implemented:

```html
<cdk-virtual-scroll-viewport itemSize="50" class="viewport">
  <div *cdkVirtualFor="let product of products" class="product-item">
    {{product.name}}
  </div>
</cdk-virtual-scroll-viewport>
```

## Component Testing

Components are tested using Angular's TestBed and component harnesses:

### Unit Tests

```typescript
describe('LoanCardComponent', () => {
  let component: LoanCardComponent;
  let fixture: ComponentFixture<LoanCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanCardComponent],
      imports: [RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanCardComponent);
    component = fixture.componentInstance;
    component.loan = {
      id: 'loan123',
      applicationNumber: 'APP-2023-001',
      borrowerId: 'user456',
      status: 'IN_REVIEW',
      loanType: 'CONVENTIONAL',
      propertyAddress: {
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02108'
      },
      propertyValue: 450000,
      loanAmount: 360000,
      downPayment: 90000,
      loanTerm: 30
    };
    fixture.detectChanges();
  });

  it('should emit archive event when archive button is clicked', () => {
    spyOn(component.archive, 'emit');
    const archiveButton = fixture.debugElement.query(By.css('.archive-btn'));
    archiveButton.triggerEventHandler('click', new Event('click'));
    expect(component.archive.emit).toHaveBeenCalledWith('loan123');
  });
});
```

### Integration Tests

```typescript
describe('LoanDashboardComponent', () => {
  let component: LoanDashboardComponent;
  let fixture: ComponentFixture<LoanDashboardComponent>;
  let loanService: jasmine.SpyObj<LoanApplicationService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const loanServiceSpy = jasmine.createSpyObj('LoanApplicationService', 
      ['getLoanApplications', 'updateLoanStatus']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', 
      ['getCurrentUser'], { currentUser$: of({ id: 'user123', roles: ['BORROWER'] }) });
    
    await TestBed.configureTestingModule({
      declarations: [LoanDashboardComponent, LoanCardComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: LoanApplicationService, useValue: loanServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanDashboardComponent);
    component = fixture.componentInstance;
    loanService = TestBed.inject(LoanApplicationService) as jasmine.SpyObj<LoanApplicationService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    
    // Setup mock data
    loanService.getLoanApplications.and.returnValue(of([/* mock loan applications */]));
    fixture.detectChanges();
  });

  it('should display loan applications when loaded', () => {
    const loanElements = fixture.debugElement.queryAll(By.css('.loan-card'));
    expect(loanElements.length).toBe(/* expected number of loans */);
  });
});
```

## Accessibility Considerations

Components are built with accessibility in mind:

```html
<!-- Accessible button with aria attributes -->
<button 
  aria-label="Archive loan application" 
  [attr.aria-disabled]="isArchiving" 
  (click)="onArchive()">
  <i class="bi bi-archive"></i>
  <span class="visually-hidden">Archive</span>
</button>
```

## Internationalization (i18n)

Components support internationalization through Angular's i18n:

```html
<!-- Translatable text -->
<h1 i18n="@@loanDashboardTitle">Loan Applications</h1>
<button i18n="@@applyNowButton">Apply Now</button>
```

## Responsive Component Design

Components are designed to be responsive using:

```html
<!-- Responsive grid using Bootstrap -->
<div class="row">
  <div class="col-12 col-md-6 col-lg-4" *ngFor="let loan of loans">
    <app-loan-card [loan]="loan"></app-loan-card>
  </div>
</div>
```

## Conclusion

The component architecture implemented in our MortgagePro Loan Management application follows modern frontend best practices while incorporating domain-specific patterns necessary for financial applications. The clear separation of concerns, hierarchical structure, and well-defined communication patterns create a scalable, maintainable, and secure codebase that meets the complex requirements of mortgage processing systems.

This architecture places special emphasis on data integrity, audit trails, and security features critical in financial applications. The component design allows for easy implementation of role-based access control, workflow management for loan processing, and the complex form validations needed in mortgage applications. By following these architectural principles, the application delivers a robust user experience while maintaining the strict compliance and security standards expected in the financial industry.
