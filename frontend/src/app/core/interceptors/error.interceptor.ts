import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = '';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMsg = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMsg = `Error Code: ${error.status}, Message: ${error.message}`;
          
          // Handle specific HTTP status codes
          switch (error.status) {
            case 401: // Unauthorized
              // Redirect to login or refresh token
              console.log('Unauthorized access. Redirecting to login...');
              // Add logic to redirect to login or refresh token
              break;
            case 403: // Forbidden
              console.log('Access forbidden. You do not have permission to access this resource.');
              break;
            case 404: // Not Found
              console.log('Resource not found.');
              break;
            case 500: // Server Error
              console.log('Server error occurred. Please try again later.');
              break;
            default:
              console.log(`Server returned code ${error.status}, body was: ${error.error}`);
          }
        }
        
        // Log error details
        console.error(errorMsg);
        
        // Return an observable with a user-facing error message
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}
