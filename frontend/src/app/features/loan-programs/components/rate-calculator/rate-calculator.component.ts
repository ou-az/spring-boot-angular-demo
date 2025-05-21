import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rate-calculator',
  templateUrl: './rate-calculator.component.html',
  styleUrls: ['./rate-calculator.component.scss'],
  standalone: false
})
export class RateCalculatorComponent implements OnInit {
  calculatorForm: FormGroup;
  results: any = null;
  showResults = false;
  loanTypes = [
    { id: 'conventional', name: 'Conventional' },
    { id: 'fha', name: 'FHA' },
    { id: 'va', name: 'VA' },
    { id: 'jumbo', name: 'Jumbo' },
    { id: 'usda', name: 'USDA' }
  ];
  terms = [
    { value: 30, label: '30 Year' },
    { value: 20, label: '20 Year' },
    { value: 15, label: '15 Year' }
  ];

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      homePrice: [300000, [Validators.required, Validators.min(50000)]],
      downPayment: [60000, [Validators.required, Validators.min(0)]],
      interestRate: [5.25, [Validators.required, Validators.min(0.1), Validators.max(20)]],
      loanTerm: [30, [Validators.required]],
      loanType: ['conventional', [Validators.required]],
      creditScore: [700, [Validators.required, Validators.min(300), Validators.max(850)]],
      propertyTax: [3000, [Validators.min(0)]],
      homeInsurance: [1200, [Validators.min(0)]],
      hoa: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Update downpayment when home price changes (default 20%)
    this.calculatorForm.get('homePrice')?.valueChanges.subscribe(price => {
      if (price) {
        const downPayment = Math.round(price * 0.2);
        this.calculatorForm.get('downPayment')?.setValue(downPayment, { emitEvent: false });
      }
    });
  }

  calculatePayment(): void {
    if (this.calculatorForm.valid) {
      const formValues = this.calculatorForm.value;
      
      // Get form values
      const homePrice = formValues.homePrice;
      const downPayment = formValues.downPayment;
      const loanAmount = homePrice - downPayment;
      const interestRate = formValues.interestRate / 100; // Convert to decimal
      const loanTermYears = formValues.loanTerm;
      const loanType = formValues.loanType;
      const creditScore = formValues.creditScore;
      
      // Calculate monthly principal and interest
      const monthlyRate = interestRate / 12;
      const numberOfPayments = loanTermYears * 12;
      const monthlyPrincipalAndInterest = this.calculateMonthlyPayment(loanAmount, monthlyRate, numberOfPayments);
      
      // Calculate property taxes and insurance monthly
      const monthlyPropertyTax = formValues.propertyTax / 12;
      const monthlyHomeInsurance = formValues.homeInsurance / 12;
      const monthlyHOA = formValues.hoa || 0;
      
      // Calculate PMI (Private Mortgage Insurance) if applicable
      let monthlyPMI = 0;
      const ltv = (loanAmount / homePrice) * 100; // Loan-to-Value ratio
      
      if (loanType === 'conventional' && ltv > 80) {
        // Approximate PMI calculation based on credit score and LTV
        let pmiRate = 0.005; // Base rate of 0.5%
        
        // Adjust PMI based on credit score
        if (creditScore >= 760) {
          pmiRate = 0.0025;
        } else if (creditScore >= 740) {
          pmiRate = 0.003;
        } else if (creditScore >= 720) {
          pmiRate = 0.0035;
        } else if (creditScore >= 700) {
          pmiRate = 0.004;
        } else if (creditScore >= 680) {
          pmiRate = 0.0045;
        }
        
        // Adjust PMI based on LTV
        if (ltv > 95) {
          pmiRate += 0.001;
        } else if (ltv > 90) {
          pmiRate += 0.0005;
        }
        
        monthlyPMI = (loanAmount * pmiRate) / 12;
      } else if (loanType === 'fha') {
        // FHA requires Mortgage Insurance Premium (MIP)
        const annualMIP = loanAmount * 0.0055; // 0.55% for most FHA loans
        monthlyPMI = annualMIP / 12;
      } else if (loanType === 'usda') {
        // USDA has a Guarantee Fee
        const annualFee = loanAmount * 0.0035; // 0.35% annual fee
        monthlyPMI = annualFee / 12;
      }
      
      // Calculate total monthly payment
      const totalMonthlyPayment = 
        monthlyPrincipalAndInterest + 
        monthlyPropertyTax + 
        monthlyHomeInsurance + 
        monthlyPMI + 
        monthlyHOA;
      
      // Set results object
      this.results = {
        loanAmount,
        downPaymentPercentage: (downPayment / homePrice) * 100,
        ltv,
        monthlyPrincipalAndInterest,
        monthlyPropertyTax,
        monthlyHomeInsurance,
        monthlyPMI,
        monthlyHOA,
        totalMonthlyPayment,
        // Additional information
        paymentBreakdown: [
          { label: 'Principal & Interest', value: monthlyPrincipalAndInterest, percentage: (monthlyPrincipalAndInterest / totalMonthlyPayment) * 100 },
          { label: 'Property Tax', value: monthlyPropertyTax, percentage: (monthlyPropertyTax / totalMonthlyPayment) * 100 },
          { label: 'Home Insurance', value: monthlyHomeInsurance, percentage: (monthlyHomeInsurance / totalMonthlyPayment) * 100 },
          { label: 'PMI / MIP', value: monthlyPMI, percentage: (monthlyPMI / totalMonthlyPayment) * 100 },
          { label: 'HOA Fees', value: monthlyHOA, percentage: (monthlyHOA / totalMonthlyPayment) * 100 }
        ]
      };
      
      this.showResults = true;
    }
  }

  calculateMonthlyPayment(principal: number, monthlyRate: number, numberOfPayments: number): number {
    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }
    
    return principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  resetCalculator(): void {
    this.calculatorForm.reset({
      homePrice: 300000,
      downPayment: 60000,
      interestRate: 5.25,
      loanTerm: 30,
      loanType: 'conventional',
      creditScore: 700,
      propertyTax: 3000,
      homeInsurance: 1200,
      hoa: 0
    });
    this.showResults = false;
    this.results = null;
  }

  // Formatting helpers
  formatCurrency(value: number): string {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  formatPercentage(value: number): string {
    return value.toFixed(2) + '%';
  }
}
