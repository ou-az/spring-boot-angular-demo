# MortgagePro Loan Management Application

A modern full-stack mortgage loan management application demonstrating enterprise-grade architecture and best practices using Spring Boot and Angular.

## Project Overview

This project is a comprehensive mortgage loan management system with:

- **Backend**: Spring Boot microservices with RESTful APIs
- **Frontend**: Angular application with modular architecture
- **Authentication**: JWT-based authentication with role-based authorization
- **Database**: PostgreSQL for storing loan applications and user data
- **Integration**: Kafka for loan processing events (optional)

## Technology Stack

### Backend

- Java 17
- Spring Boot 3.2
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- RESTful API design
- Kafka for event streaming (feature-flagged)
- Testing with JUnit 5 and Mockito

### Frontend

- Angular 16+
- Standalone Components Architecture
- Reactive Forms
- RxJS for reactive programming
- Modular design with Core/Feature/Shared pattern
- Lazy-loaded feature modules
- Bootstrap for responsive UI design
- Financial calculation utilities

### DevOps

- Docker containerization
- Kubernetes deployment configurations
- CI/CD with GitHub Actions

## Architecture

The application follows a modern, scalable architecture:

### Backend Architecture

- Microservices design with clear domain boundaries
- RESTful API following best practices
- Layered architecture (Controller → Service → Repository)
- Comprehensive exception handling
- Event-driven architecture using Kafka for loan processing events

### Frontend Architecture

- Core/Feature/Shared module pattern
- Standalone components for efficient bundling
- Service-based state management
- Lazy-loaded feature modules
- Strong typing with TypeScript interfaces
- Comprehensive documentation in the `/docs` directory

## Getting Started

### Prerequisites

- Java 17+
- Node.js 16+
- Docker and Docker Compose (optional)
- PostgreSQL (or Docker container)

### Running the Application Locally

#### Backend

```bash
cd backend
./mvnw spring-boot:run
```

#### Frontend

```bash
cd frontend
npm install
ng serve
```

### Using Docker

```bash
docker-compose up -d
```

## API Documentation

The backend API documentation is available at `/swagger-ui.html` when the application is running. It provides details on all available endpoints for loan management.

## Authentication

The application implements JWT authentication with:

- Secure token handling
- Role-based authorization (Admin, Loan Officer, Customer)
- HTTP-only cookies for token storage
- Cross-Site Request Forgery (CSRF) protection

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Angular Architecture Overview](./docs/01-Angular-Architecture-Overview.md)
- [Angular Modular Architecture](./docs/02-Angular-Modular-Architecture.md)
- [Angular Design Patterns & Best Practices](./docs/03-Angular-Design-Patterns-Best-Practices.md)
- [Angular Component Architecture](./docs/04-Angular-Component-Architecture.md)
- [Angular State Management & Security](./docs/05-Angular-State-Management-Security.md)
- [Mortgage Calculation Models](./docs/06-Mortgage-Calculation-Models.md)

## Features

- User authentication and authorization
- Mortgage loan application processing
- Loan programs showcase
- Interactive mortgage calculator
- Loan dashboard with analytics
- Multi-step loan application form
- Responsive UI with Bootstrap
- Form validation with reactive forms
- Error handling and notifications
- Loading indicators and progress feedback

## Project Structure

```typescript
mortgagepro-loan-management/
├── backend/                 # Spring Boot application
│   ├── src/main/java        # Java source files
│   ├── src/main/resources   # Configuration files
│   └── src/test             # Tests
├── frontend/                # Angular application
│   ├── src/app              # Application code
│   │   ├── core             # Core module (services, guards, etc.)
│   │   ├── features         # Feature modules
│   │   │   ├── loans        # Loan management features
│   │   │   ├── loan-programs # Mortgage product offerings
│   │   │   └── auth         # Authentication features
│   │   ├── shared           # Shared components and utilities
│   │   └── layouts          # Application layouts
│   └── src/assets           # Static assets
├── docs/                    # Documentation
└── kubernetes/              # Kubernetes deployment files
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
