import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { LoanDashboardComponent } from './components/loan-dashboard/loan-dashboard.component';
import { LoanDetailComponent } from './components/loan-detail/loan-detail.component';
import { LoanApplicationComponent } from './components/loan-application/loan-application.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: LoanDashboardComponent },
  { path: 'detail/:id', component: LoanDetailComponent },
  { path: 'application', component: LoanApplicationComponent }
];

@NgModule({
  declarations: [
    LoanDashboardComponent,
    LoanDetailComponent,
    LoanApplicationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class LoansModule { }
