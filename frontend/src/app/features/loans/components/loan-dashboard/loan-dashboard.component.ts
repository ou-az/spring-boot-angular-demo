import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

// Loan status types that would typically be defined in a shared models directory
export type LoanStatus = 'pending' | 'approved' | 'denied' | 'processing' | 'closing' | 'funded';

// Loan interface that would typically be in a shared models directory
export interface Loan {
  id: number;
  customerName: string;
  loanAmount: number;
  interestRate: number;
  term: number; // in months
  status: LoanStatus;
  applicationDate: Date;
  closingDate?: Date;
  type: 'Conventional' | 'FHA' | 'VA' | 'USDA';
  propertyAddress?: string;
  lastUpdated: Date;
}

@Component({
  selector: 'app-loan-dashboard',
  templateUrl: './loan-dashboard.component.html',
  styleUrls: ['./loan-dashboard.component.scss'],
  standalone: false
})
export class LoanDashboardComponent implements OnInit {
  // Make Math available to the template
  Math = Math;
  loans$: Observable<Loan[]> = of([]);
  pendingLoans$: Observable<Loan[]> = of([]);
  processingLoans$: Observable<Loan[]> = of([]);
  closingLoans$: Observable<Loan[]> = of([]);
  fundedLoans$: Observable<Loan[]> = of([]);
  
  // Metrics for dashboard
  totalLoanAmount = 0;
  averageInterestRate = 0;
  pendingCount = 0;
  approvedCount = 0;
  
  selectedFilter: string = 'all';
  searchTerm: string = '';
  
  constructor(private router: Router) { }

  ngOnInit(): void {
    // In a real app, this would come from a loan service that connects to the backend
    this.fetchLoans();
    this.calculateMetrics();
  }
  
  fetchLoans(): void {
    // Mock data for demonstration - in a real app this would come from a service call
    const mockLoans: Loan[] = [
      {
        id: 1001,
        customerName: 'John Smith',
        loanAmount: 320000,
        interestRate: 5.125,
        term: 360, // 30 years
        status: 'approved',
        applicationDate: new Date(2025, 4, 1),
        type: 'Conventional',
        propertyAddress: '123 Main St, Anytown, CA 91234',
        lastUpdated: new Date(2025, 4, 15)
      },
      {
        id: 1002,
        customerName: 'Sarah Johnson',
        loanAmount: 285000,
        interestRate: 4.875,
        term: 360,
        status: 'processing',
        applicationDate: new Date(2025, 4, 5),
        type: 'FHA',
        propertyAddress: '456 Oak Ave, Somewhere, CA 91235',
        lastUpdated: new Date(2025, 4, 18)
      },
      {
        id: 1003,
        customerName: 'Michael Brown',
        loanAmount: 425000,
        interestRate: 5.25,
        term: 360,
        status: 'pending',
        applicationDate: new Date(2025, 4, 10),
        type: 'Conventional',
        propertyAddress: '789 Pine St, Nowhere, CA 91236',
        lastUpdated: new Date(2025, 4, 10)
      },
      {
        id: 1004,
        customerName: 'Jennifer Davis',
        loanAmount: 550000,
        interestRate: 5.0,
        term: 360,
        status: 'closing',
        applicationDate: new Date(2025, 3, 15),
        type: 'Conventional',
        propertyAddress: '321 Cedar Rd, Elsewhere, CA 91237',
        lastUpdated: new Date(2025, 4, 20)
      },
      {
        id: 1005,
        customerName: 'Robert Wilson',
        loanAmount: 375000,
        interestRate: 4.75,
        term: 180, // 15 years
        status: 'funded',
        applicationDate: new Date(2025, 3, 1),
        closingDate: new Date(2025, 4, 12),
        type: 'VA',
        propertyAddress: '654 Maple Dr, Anywhere, CA 91238',
        lastUpdated: new Date(2025, 4, 12)
      }
    ];
    
    this.loans$ = of(mockLoans);
    
    // Filter loans by status
    this.pendingLoans$ = of(mockLoans.filter(loan => loan.status === 'pending'));
    this.processingLoans$ = of(mockLoans.filter(loan => ['processing', 'approved'].includes(loan.status)));
    this.closingLoans$ = of(mockLoans.filter(loan => loan.status === 'closing'));
    this.fundedLoans$ = of(mockLoans.filter(loan => loan.status === 'funded'));
  }
  
  calculateMetrics(): void {
    // In a real app, this would calculate metrics from actual loan data
    // These are hardcoded here for demonstration purposes
    this.totalLoanAmount = 1955000; // sum of all loan amounts
    this.averageInterestRate = 5.0; // average interest rate
    this.pendingCount = 1;
    this.approvedCount = 3;
  }
  
  viewLoanDetail(loanId: number): void {
    this.router.navigate(['/loans/detail', loanId]);
  }
  
  newLoanApplication(): void {
    this.router.navigate(['/loans/application']);
  }
  
  filterLoans(status: string): void {
    this.selectedFilter = status;
    // In a real app, this would update the loans$ observable based on filter
  }
  
  searchLoans(): void {
    // In a real app, this would filter loans based on searchTerm
    console.log('Searching for:', this.searchTerm);
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
}
