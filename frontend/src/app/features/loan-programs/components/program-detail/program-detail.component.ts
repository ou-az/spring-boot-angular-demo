import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanProgram } from '../loan-programs/loan-programs.component';

@Component({
  selector: 'app-program-detail',
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss'],
  standalone: false
})
export class ProgramDetailComponent implements OnInit {
  programId: number = 0;
  program: LoanProgram | null = null;
  
  // Sample FAQs for each program
  faqs: { question: string, answer: string }[] = [];
  
  // Sample comparison data between different loan types
  comparisonData = {
    downPayment: [
      { program: 'Conventional', value: '3-20%' },
      { program: 'FHA', value: '3.5%+' },
      { program: 'VA', value: '0%' },
      { program: 'USDA', value: '0%' },
      { program: 'Jumbo', value: '10-20%' }
    ],
    creditScore: [
      { program: 'Conventional', value: '620+' },
      { program: 'FHA', value: '580+' },
      { program: 'VA', value: '580-620+' },
      { program: 'USDA', value: '640+' },
      { program: 'Jumbo', value: '700+' }
    ],
    mortgageInsurance: [
      { program: 'Conventional', value: 'Required if <20% down' },
      { program: 'FHA', value: 'Required for all loans' },
      { program: 'VA', value: 'Not required' },
      { program: 'USDA', value: 'Required for all loans' },
      { program: 'Jumbo', value: 'Varies by lender' }
    ]
  };
  
  // Mock data for all loan programs - in a real app, this would come from a service
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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get program ID from route params
    this.route.params.subscribe(params => {
      this.programId = +params['id'];
      this.loadProgramDetails();
    });
  }

  loadProgramDetails(): void {
    // In a real app, this would come from a service call to the backend
    this.program = this.loanPrograms.find(p => p.id === this.programId) || null;
    
    if (this.program) {
      this.loadFaqs();
    }
  }

  loadFaqs(): void {
    // Load program-specific FAQs based on program ID
    switch(this.programId) {
      case 1: // Conventional
        this.faqs = [
          { 
            question: 'What is the minimum down payment for a conventional loan?', 
            answer: 'Conventional loans typically require a minimum down payment of 3% for first-time homebuyers and 5% for others, though putting down 20% will help you avoid private mortgage insurance (PMI).'
          },
          { 
            question: 'What credit score do I need for a conventional loan?', 
            answer: 'Most lenders require a minimum credit score of 620 for conventional loans, though better rates are available to borrowers with scores of 740 or higher.'
          },
          { 
            question: 'Can I use gift funds for my down payment?', 
            answer: 'Yes, conventional loans allow gift funds for down payments, but they may require documentation proving the source of the gift.'
          }
        ];
        break;
      case 2: // FHA
        this.faqs = [
          { 
            question: 'What is the minimum down payment for an FHA loan?', 
            answer: 'FHA loans require a minimum down payment of 3.5% if your credit score is 580 or higher. If your credit score is between 500-579, the minimum down payment is 10%.'
          },
          { 
            question: 'Can FHA loans be used for any type of property?', 
            answer: 'FHA loans can be used for primary residences only, not investment properties or second homes. The property must meet FHA minimum property standards.'
          },
          { 
            question: 'How does FHA mortgage insurance work?', 
            answer: 'FHA loans require both an upfront mortgage insurance premium (UFMIP) and an annual mortgage insurance premium (MIP). The UFMIP is 1.75% of the loan amount and can be financed into the loan. The annual MIP varies but is typically between 0.45% and 1.05% of the loan amount, paid monthly.'
          }
        ];
        break;
      case 3: // VA
        this.faqs = [
          { 
            question: 'Who is eligible for a VA loan?', 
            answer: 'VA loans are available to active-duty service members, veterans, and eligible surviving spouses. You must have served a minimum period based on when you served and received an honorable discharge.'
          },
          { 
            question: 'Do VA loans have mortgage insurance?', 
            answer: 'No, VA loans do not require monthly mortgage insurance. However, they do have a one-time VA funding fee, which varies based on your military category, down payment amount, and whether it is your first VA loan.'
          },
          { 
            question: 'Can I use a VA loan more than once?', 
            answer: 'Yes, you can use your VA loan benefit multiple times. If you have paid off your previous VA loan and sold the property, you can have your full entitlement restored. You may also have remaining entitlement that allows you to have multiple VA loans at once.'
          }
        ];
        break;
      default:
        this.faqs = [
          { 
            question: 'How do I determine which mortgage is right for me?', 
            answer: 'The best mortgage for you depends on several factors including your credit score, available down payment, income stability, how long you plan to stay in the home, and whether you qualify for special programs like VA or USDA loans.'
          },
          { 
            question: 'What documents do I need to apply for a mortgage?', 
            answer: 'Typically, you will need proof of income (W-2s, pay stubs, tax returns), proof of assets (bank statements, investment accounts), identification documents, employment verification, and credit history information.'
          },
          { 
            question: 'How long does the mortgage approval process take?', 
            answer: 'The mortgage approval process typically takes 30-45 days from application to closing, but can vary based on your financial situation, the lender workload, and any issues that arise during underwriting.'
          }
        ];
    }
  }

  goBack(): void {
    this.router.navigate(['/loan-programs']);
  }

  goToCalculator(): void {
    this.router.navigate(['/loan-programs/calculator']);
  }

  startApplication(): void {
    this.router.navigate(['/loans/application']);
  }
}
