import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Loan, LoanStatus } from '../loan-dashboard/loan-dashboard.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss'],
  standalone: false
})
export class LoanDetailComponent implements OnInit {
  // Make Math available to the template
  Math = Math;
  loanId: number;
  loan: Loan | null = null;
  loanStatusForm: FormGroup;
  statusOptions: { value: LoanStatus, label: string }[] = [
    { value: 'pending', label: 'Pending Review' },
    { value: 'processing', label: 'Processing' },
    { value: 'approved', label: 'Approved' },
    { value: 'closing', label: 'Closing' },
    { value: 'funded', label: 'Funded' },
    { value: 'denied', label: 'Denied' }
  ];
  
  // Audit log for loan status changes - would come from backend in real app
  statusHistory = [
    { timestamp: new Date(2025, 4, 1), status: 'pending', user: 'System' },
    { timestamp: new Date(2025, 4, 5), status: 'processing', user: 'Jane Smith' },
    { timestamp: new Date(2025, 4, 12), status: 'approved', user: 'Robert Johnson' }
  ];
  
  // Document list - would come from backend in real app
  documents = [
    { id: 1, name: 'Loan Application Form', dateUploaded: new Date(2025, 4, 1), status: 'verified' },
    { id: 2, name: 'Income Verification', dateUploaded: new Date(2025, 4, 2), status: 'pending' },
    { id: 3, name: 'Property Appraisal', dateUploaded: new Date(2025, 4, 8), status: 'verified' },
    { id: 4, name: 'Credit Report', dateUploaded: new Date(2025, 4, 3), status: 'verified' }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loanId = 0;
    this.loanStatusForm = this.fb.group({
      status: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loanId = +params['id'];
      this.loadLoanDetails();
    });
  }
  
  loadLoanDetails(): void {
    // In a real app, this would come from a service call to the backend
    // Mock data for demonstration
    if (this.loanId === 1001) {
      this.loan = {
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
      };
      
      this.loanStatusForm.patchValue({
        status: this.loan.status
      });
    } else {
      // Navigate back to dashboard if loan not found
      setTimeout(() => {
        this.router.navigate(['/loans/dashboard']);
      }, 100);
    }
  }
  
  updateLoanStatus(): void {
    if (this.loanStatusForm.valid && this.loan) {
      const newStatus = this.loanStatusForm.get('status')?.value;
      const note = this.loanStatusForm.get('note')?.value;
      
      console.log(`Updating loan ${this.loanId} status to ${newStatus} with note: ${note}`);
      
      // In a real app, this would call a service to update the status in the backend
      // For demo purposes, just update the local object
      if (this.loan) {
        this.loan.status = newStatus;
        this.loan.lastUpdated = new Date();
        
        // Add to status history
        this.statusHistory.push({
          timestamp: new Date(),
          status: newStatus,
          user: 'Current User'
        });
        
        // Sort history by most recent first
        this.statusHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      }
    }
  }
  
  goBack(): void {
    this.router.navigate(['/loans/dashboard']);
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  // Calculate monthly payment to avoid using Math.pow directly in template
  calculateMonthlyPayment(loanAmount: number, interestRate: number, term: number): number {
    const monthlyRate = interestRate / 100 / 12;
    return loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -term));
  }
  
  getStatusClass(status: string): string {
    const statusMap: {[key: string]: string} = {
      'pending': 'warning',
      'processing': 'info',
      'approved': 'primary',
      'closing': 'secondary',
      'funded': 'success',
      'denied': 'danger',
      'verified': 'success'
    };
    
    return `bg-${statusMap[status] || 'secondary'}`;
  }
}
