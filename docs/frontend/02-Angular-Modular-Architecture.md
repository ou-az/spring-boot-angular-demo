# Angular Modular Architecture

## Introduction

This document details the modular architecture implemented in our MortgagePro Loan Management application. The architecture is designed to support large-scale financial applications with clear separation of concerns, scalability, and maintainability in mind - similar to the modular architecture principles used in enterprise banking applications.

## Core/Feature/Shared Module Pattern

Our application implements the widely-used Core/Feature/Shared module pattern, which provides clear boundaries between different parts of the application:

### Core Module

The Core module contains singleton services that should be instantiated only once throughout the application lifecycle. This is enforced through a guard in the constructor:

```typescript
export class CoreModule { 
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
```

Key components in our Core module:

- **HTTP Interceptors**: Manage authentication tokens and centralized error handling
- **Authentication Services**: Handle user authentication, token management, and session persistence
- **Guards**: Protect routes based on authentication state and user roles
- **Domain Models**: Define the core data structures used throughout the application

### Feature Modules

Feature modules encapsulate all functionality for a specific feature domain. Each feature module:

- Is lazy-loaded for better performance
- Contains its own routing configuration
- Has feature-specific components, services, and models
- Can be developed, tested, and maintained independently

Our feature modules include:

1. **Loans Module**: Manages loan applications, dashboard, and detailed loan information
2. **Loan Programs Module**: Showcases mortgage products, details, and provides rate calculators
3. **Auth Module**: Handles user authentication and registration with role-based access for loan officers and customers

### Shared Module

The Shared module contains reusable components, directives, and pipes that are used across multiple feature modules. To avoid circular dependencies, the Shared module:

- Never imports feature modules
- Only imports Angular modules (CommonModule, FormsModule, etc.)
- Exports all its declarations and imported modules

## Standalone Components Architecture

With Angular's standalone components, we've implemented a hybrid approach that reduces the need for NgModules where appropriate:

- **MainLayoutComponent**: Standalone component providing the application shell
- **HomeComponent**: Standalone component for the landing page
- **LoginComponent**: Standalone component for authentication

Benefits of standalone components:

1. Reduced boilerplate code
2. Simplified dependency management
3. Better tree-shaking for smaller bundle sizes
4. More explicit component dependencies

## Module Communication Patterns

Communication between modules follows these patterns:

### Service-based Communication

Services from the Core module act as centralized state managers and communication channels between features:

```typescript
// AuthService in Core module
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Methods to update and access user state
}
```

### Event-based Communication

For cross-cutting concerns, we use events through RxJS Subjects and Observables:

```typescript
// Notification service for application-wide notifications
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  // Methods to add and remove notifications
}
```

## Lazy Loading Strategy

Lazy loading is implemented for all feature modules to improve the application's initial load time. This is configured in the routing module:

```typescript
const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { 
        path: 'loans', 
        loadChildren: () => import('./features/loans/loans.module')
          .then(m => m.LoansModule),
        canActivate: [AuthGuard] 
      },
      { 
        path: 'loan-programs', 
        loadChildren: () => import('./features/loan-programs/loan-programs.module')
          .then(m => m.LoanProgramsModule),
        canActivate: [AuthGuard] 
      }
    ]
  }
];
```

## Module Dependency Management

To maintain a clean architecture, we follow these dependency rules:

1. **Feature modules never import other feature modules**
2. **Core module never imports feature modules**
3. **Shared module never imports feature or core modules**
4. **Feature modules import shared and core modules as needed**

This creates a clear dependency hierarchy that prevents circular dependencies and makes the codebase easier to maintain.

## Testing Strategy for Modules

Each module type has a specific testing strategy:

- **Core module**: Unit tests focused on services and business logic
- **Feature modules**: Component tests and integration tests
- **Shared module**: Isolated component tests

## Benefits of This Architecture

The modular architecture provides several significant benefits:

1. **Team Scalability**: Multiple teams can work on different feature modules simultaneously
2. **Code Organization**: Clear boundaries make the codebase more navigable
3. **Performance**: Lazy loading improves initial load time
4. **Maintainability**: Isolation of features reduces the risk of changes affecting other parts of the application
5. **Testability**: Modules can be tested in isolation
6. **Reusability**: Shared components can be reused across features

## Relation to Backend Microservices

This modular frontend architecture aligns well with a backend microservices architecture for mortgage processing:

- Feature modules correspond to specific backend microservices (loan application processing, loan program management)
- Services in feature modules communicate with specific API gateways for loan operations
- Core services handle cross-cutting concerns like authentication and audit logging, critical for financial applications
- Event-driven architecture allows for asynchronous loan processing and status updates

This creates a cohesive full-stack architecture with clear boundaries and responsibilities that supports the complex workflow of mortgage loan origination and servicing.
