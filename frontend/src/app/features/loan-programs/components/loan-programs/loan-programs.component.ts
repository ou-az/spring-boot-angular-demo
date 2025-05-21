import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Loan program types for mortgage products
export interface LoanProgram {
  id: number;
  name: string;
  description: string;
  interestRateRange: string;
  termYears: number[];
  minDownPayment: number;
  eligibilityNotes: string;
  featuredBenefits: string[];
  icon: string;
}

@Component({
  selector: 'app-loan-programs',
  templateUrl: './loan-programs.component.html',
  styleUrls: ['./loan-programs.component.scss'],
  standalone: false
})
export class LoanProgramsComponent implements OnInit {
  loanPrograms: LoanProgram[] = [
    {
      id: 1,
      name: 'Conventional Fixed-Rate Mortgage',
      description: 'Traditional fixed-rate mortgage loans with stable monthly payments.',
      interestRateRange: '5.25% - 6.75%',
      termYears: [15, 20, 30],
      minDownPayment: 3,
      eligibilityNotes: 'Credit score of 620 or higher recommended. PMI required for down payments less than 20%.',
      featuredBenefits: [
        'Predictable payments for the life of the loan',
        'Available for primary residences, second homes, and investment properties',
        'Various term options to fit your financial goals'
      ],
      icon: 'bi-house'
    },
    {
      id: 2,
      name: 'FHA Loans',
      description: 'Government-backed loans designed for homebuyers with lower credit scores or smaller down payments.',
      interestRateRange: '5.00% - 6.50%',
      termYears: [15, 30],
      minDownPayment: 3.5,
      eligibilityNotes: 'Credit score of 580 or higher for 3.5% down payment. Mortgage insurance required.',
      featuredBenefits: [
        'Lower down payment requirements',
        'More flexible credit requirements',
        'Lower closing costs'
      ],
      icon: 'bi-shield'
    },
    {
      id: 3,
      name: 'VA Loans',
      description: 'Special loan program for veterans, active-duty service members, and eligible spouses.',
      interestRateRange: '4.75% - 6.25%',
      termYears: [15, 30],
      minDownPayment: 0,
      eligibilityNotes: 'Must have eligible military service. Certificate of Eligibility (COE) required.',
      featuredBenefits: [
        'No down payment required in most cases',
        'No monthly mortgage insurance premiums',
        'Limited closing costs'
      ],
      icon: 'bi-award'
    },
    {
      id: 4,
      name: 'Jumbo Loans',
      description: 'Loans that exceed the conforming loan limits set by Fannie Mae and Freddie Mac.',
      interestRateRange: '5.50% - 7.00%',
      termYears: [15, 30],
      minDownPayment: 10,
      eligibilityNotes: 'Credit score of 700+ recommended. Higher income and reserves requirements.',
      featuredBenefits: [
        'Finance high-value properties',
        'Competitive rates for well-qualified borrowers',
        'Various term options available'
      ],
      icon: 'bi-currency-dollar'
    },
    {
      id: 5,
      name: 'Adjustable-Rate Mortgage (ARM)',
      description: 'Mortgage with an interest rate that adjusts periodically based on market indexes.',
      interestRateRange: '4.50% - 6.00% (initial)',
      termYears: [30],
      minDownPayment: 5,
      eligibilityNotes: 'Credit score of 620 or higher recommended. Initial fixed-rate period followed by adjustable rates.',
      featuredBenefits: [
        'Lower initial interest rates',
        'Good for buyers who plan to move or refinance before the fixed period ends',
        'Rate caps limit how much rates can increase'
      ],
      icon: 'bi-graph-up'
    },
    {
      id: 6,
      name: 'USDA Rural Development Loans',
      description: 'Government-backed loans for rural and suburban homebuyers with low to moderate incomes.',
      interestRateRange: '4.75% - 6.25%',
      termYears: [30],
      minDownPayment: 0,
      eligibilityNotes: 'Property must be in an eligible rural area. Income limits apply based on area median income.',
      featuredBenefits: [
        'No down payment required',
        'Lower mortgage insurance rates compared to FHA loans',
        'Competitive interest rates'
      ],
      icon: 'bi-tree'
    }
  ];

  featuredProgram: LoanProgram;

  constructor(private router: Router) {
    // Select a random program to feature
    this.featuredProgram = this.loanPrograms[0];
  }

  ngOnInit(): void {
    // Randomly select a featured program each time the page loads
    const randomIndex = Math.floor(Math.random() * this.loanPrograms.length);
    this.featuredProgram = this.loanPrograms[randomIndex];
  }

  viewProgramDetails(programId: number): void {
    this.router.navigate(['/loan-programs/detail', programId]);
  }

  goToCalculator(): void {
    this.router.navigate(['/loan-programs/calculator']);
  }

  // Format percentage as string with % sign
  formatPercentage(value: number): string {
    return `${value}%`;
  }
}
